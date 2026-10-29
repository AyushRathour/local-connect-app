import { Router, Response } from 'express';
import { db, Review } from '../db';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/v1/reviews/service/:id
router.get('/service/:id', (req, res: Response) => {
  const reviews = db.get().reviews.filter((r) => r.serviceId === req.params.id);
  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ success: true, data: reviews });
});

// GET /api/v1/reviews/provider/:id
router.get('/provider/:id', (req, res: Response) => {
  const reviews = db.get().reviews.filter((r) => r.providerId === req.params.id);
  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ success: true, data: reviews });
});

// POST /api/v1/reviews - Submit a review for a completed booking
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, rating (1-5), and written comment are required.',
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    // 1. Locate booking and verify ownership
    const booking = db.get().bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.customerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer who booked this appointment can review it.',
      });
    }

    // 2. Verify completion
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after the service has been marked as completed.',
      });
    }

    // 3. One review per completed booking check
    if (booking.hasReview) {
      return res.status(409).json({
        success: false,
        message: 'A review has already been submitted for this booking.',
      });
    }

    const now = new Date().toISOString();
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      bookingId: booking.id,
      customerId: user.id,
      customerName: user.name,
      customerAvatar: user.avatar,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      serviceTitle: booking.serviceTitle,
      rating: numericRating,
      comment: comment.trim(),
      createdAt: now,
    };

    db.update((database) => {
      database.reviews.unshift(newReview);

      // Mark booking as reviewed
      const b = database.bookings.find((item) => item.id === bookingId);
      if (b) {
        b.hasReview = true;
      }

      // Recalculate Service rating
      const serviceReviews = database.reviews.filter((r) => r.serviceId === booking.serviceId);
      const avgServiceRating =
        serviceReviews.reduce((sum, r) => sum + r.rating, 0) / (serviceReviews.length || 1);
      const targetService = database.services.find((s) => s.id === booking.serviceId);
      if (targetService) {
        targetService.rating = Number(avgServiceRating.toFixed(1));
        targetService.reviewsCount = serviceReviews.length;
      }

      // Recalculate Provider rating
      const providerReviews = database.reviews.filter((r) => r.providerId === booking.providerId);
      const avgProviderRating =
        providerReviews.reduce((sum, r) => sum + r.rating, 0) / (providerReviews.length || 1);
      const targetProvider = database.providers.find((p) => p.userId === booking.providerId);
      if (targetProvider) {
        targetProvider.rating = Number(avgProviderRating.toFixed(1));
        targetProvider.reviewsCount = providerReviews.length;
      }

      // Notify provider
      database.notifications.unshift({
        id: `notif_${Date.now()}_rev`,
        userId: booking.providerId,
        title: 'New Customer Review',
        message: `${user.name} rated your service "${booking.serviceTitle}" ${numericRating} stars: "${comment.slice(0, 40)}..."`,
        type: 'system',
        isRead: false,
        link: '/provider/dashboard',
        createdAt: now,
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Review posted successfully. Thank you for your feedback!',
      data: newReview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// DELETE /api/v1/reviews/:id (Admin moderation)
router.delete('/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const reviewId = req.params.id;
  db.update((database) => {
    database.reviews = database.reviews.filter((r) => r.id !== reviewId);
  });
  return res.json({ success: true, message: 'Review removed by administrator.' });
});

export default router;
