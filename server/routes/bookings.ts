import { Router, Response } from 'express';
import { db, Booking, Notification } from '../db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/v1/bookings/my - Get bookings for current user (Customer gets theirs, Provider gets theirs, Admin gets all)
router.get('/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allBookings = db.get().bookings;

  let userBookings: Booking[] = [];
  if (user.role === 'admin') {
    userBookings = [...allBookings];
  } else if (user.role === 'provider') {
    userBookings = allBookings.filter((b) => b.providerId === user.id);
  } else {
    userBookings = allBookings.filter((b) => b.customerId === user.id);
  }

  // Sort descending by created/appointment date
  userBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    data: userBookings,
  });
});

// GET /api/v1/bookings/:id
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const booking = db.get().bookings.find((b) => b.id === req.params.id);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  // Check authorization
  if (user.role !== 'admin' && booking.customerId !== user.id && booking.providerId !== user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
  }

  return res.json({
    success: true,
    data: booking,
  });
});

// POST /api/v1/bookings - Create new booking
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { serviceId, appointmentDate, startTime, address, city, notes } = req.body;

    if (!serviceId || !appointmentDate || !startTime || !address) {
      return res.status(400).json({
        success: false,
        message: 'Service, appointment date, time slot, and service address are required.',
      });
    }

    // 1. Verify service exists and is active
    const service = db.get().services.find((s) => s.id === serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Selected service does not exist.' });
    }
    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This service is currently unavailable for bookings.',
      });
    }

    // 2. Prevent user from booking their own service
    if (service.providerId === user.id) {
      return res.status(400).json({
        success: false,
        message: 'Providers cannot book their own services.',
      });
    }

    // 3. Double-booking check: Check if provider already has a confirmed booking for the same date & time
    const conflictingBooking = db.get().bookings.find(
      (b) =>
        b.providerId === service.providerId &&
        b.appointmentDate === appointmentDate &&
        b.startTime === startTime &&
        (b.status === 'confirmed' || b.status === 'pending')
    );

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'The selected appointment slot is already reserved. Please select another time or date.',
      });
    }

    // Compute end time based on duration
    const duration = service.durationMinutes || 60;
    const [timeStr, period] = startTime.split(' ');
    let [hours, mins] = timeStr.split(':').map(Number);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const startDate = new Date();
    startDate.setHours(hours, mins, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    const endPeriod = endDate.getHours() >= 12 ? 'PM' : 'AM';
    let endHours = endDate.getHours() % 12;
    if (endHours === 0) endHours = 12;
    const endMins = endDate.getMinutes().toString().padStart(2, '0');
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins} ${endPeriod}`;

    const now = new Date().toISOString();
    const newBooking: Booking = {
      id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      providerId: service.providerId,
      providerName: service.providerName,
      serviceId: service.id,
      serviceTitle: service.title,
      categoryName: service.categoryName,
      appointmentDate,
      startTime,
      endTime,
      address: address.trim(),
      city: city || 'New Delhi',
      notes: notes ? notes.trim() : undefined,
      agreedPrice: service.price, // CRITICAL: Snapshots server price, no client manipulation!
      status: 'pending',
      paymentStatus: 'unpaid',
      hasReview: false,
      createdAt: now,
      updatedAt: now,
    };

    // Notifications
    const providerNotif: Notification = {
      id: `notif_${Date.now()}_p`,
      userId: service.providerId,
      title: 'New Booking Request',
      message: `${user.name} booked "${service.title}" for ${appointmentDate} at ${startTime}.`,
      type: 'booking_request',
      isRead: false,
      link: '/provider/dashboard',
      createdAt: now,
    };

    const customerNotif: Notification = {
      id: `notif_${Date.now()}_c`,
      userId: user.id,
      title: 'Booking Request Submitted',
      message: `Your booking for "${service.title}" on ${appointmentDate} at ${startTime} has been sent to ${service.providerName}.`,
      type: 'system',
      isRead: false,
      link: '/customer/dashboard',
      createdAt: now,
    };

    db.update((database) => {
      database.bookings.unshift(newBooking);
      database.notifications.unshift(providerNotif, customerNotif);
    });

    return res.status(201).json({
      success: true,
      message: 'Booking request placed successfully. The provider will review and confirm shortly.',
      data: newBooking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return res.status(500).json({ success: false, message: 'Server error while processing booking.' });
  }
});

// PATCH /api/v1/bookings/:id/status - Update booking status (Provider: accept, reject, complete; Admin: any)
router.patch('/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    const user = req.user!;

    const validStatuses: Booking['status'][] = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }

    const booking = db.get().bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Permission checks
    if (user.role === 'provider' && booking.providerId !== user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Booking is assigned to another provider.' });
    }
    if (user.role === 'customer' && booking.customerId !== user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this booking.' });
    }
    if (user.role === 'customer' && status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'Customers can only cancel bookings.' });
    }

    // State transition guards
    if (booking.status === 'completed' && status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot change status.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled bookings cannot be modified.' });
    }

    let updatedBooking: Booking | undefined;
    const now = new Date().toISOString();

    db.update((database) => {
      const b = database.bookings.find((item) => item.id === bookingId);
      if (b) {
        b.status = status;
        b.updatedAt = now;

        if (status === 'completed') {
          b.paymentStatus = 'paid';
          // Increment provider completed jobs
          const provider = database.providers.find((p) => p.userId === b.providerId);
          if (provider) {
            provider.completedJobs += 1;
          }
        }

        updatedBooking = b;

        // Push notification to customer
        let notifTitle = `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        let notifMsg = `Your booking for "${b.serviceTitle}" is now ${status}.`;
        if (status === 'confirmed') {
          notifMsg = `Great news! ${b.providerName} confirmed your appointment for ${b.appointmentDate} at ${b.startTime}.`;
        } else if (status === 'rejected') {
          notifMsg = `Provider ${b.providerName} was unable to accept your booking for ${b.appointmentDate}.`;
        } else if (status === 'completed') {
          notifMsg = `Service completed! How was your experience with ${b.providerName}? Share your review now.`;
        }

        database.notifications.unshift({
          id: `notif_${Date.now()}`,
          userId: b.customerId,
          title: notifTitle,
          message: notifMsg,
          type: status === 'confirmed' ? 'booking_confirmed' : status === 'completed' ? 'booking_completed' : 'system',
          isRead: false,
          link: '/customer/dashboard',
          createdAt: now,
        });
      }
    });

    return res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
});

// PATCH /api/v1/bookings/:id/cancel
router.patch('/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const user = req.user!;
  const booking = db.get().bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  if (user.role !== 'admin' && booking.customerId !== user.id && booking.providerId !== user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
  }

  if (booking.status === 'completed') {
    return res.status(400).json({ success: false, message: 'Completed bookings cannot be cancelled.' });
  }

  const now = new Date().toISOString();
  db.update((database) => {
    const b = database.bookings.find((item) => item.id === bookingId);
    if (b) {
      b.status = 'cancelled';
      b.updatedAt = now;

      // Notify other party
      const notifyTarget = user.id === b.customerId ? b.providerId : b.customerId;
      database.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: notifyTarget,
        title: 'Booking Cancelled',
        message: `Booking #${b.id.substring(0, 8)} for "${b.serviceTitle}" was cancelled by ${user.name}.`,
        type: 'booking_cancelled',
        isRead: false,
        createdAt: now,
      });
    }
  });

  return res.json({
    success: true,
    message: 'Booking cancelled successfully.',
  });
});

export default router;
