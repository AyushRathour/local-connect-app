import { Router, Response } from 'express';
import { db, ProviderProfile } from '../db';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/v1/providers - List verified providers
router.get('/', (_req, res: Response) => {
  const providers = db.get().providers.filter((p) => p.verificationStatus === 'verified');
  return res.json({ success: true, data: providers });
});

// GET /api/v1/providers/me - Current logged in provider profile
router.get('/me', requireAuth, requireRole('provider', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let profile = db.get().providers.find((p) => p.userId === user.id);

  if (!profile && user.role === 'provider') {
    // Auto-create blank profile if missing
    profile = {
      id: `prov_${Date.now()}`,
      userId: user.id,
      businessName: `${user.name}'s Services`,
      bio: 'Professional service provider.',
      experienceYears: 1,
      serviceAreas: ['New Delhi'],
      verificationStatus: 'verified',
      rating: 5.0,
      reviewsCount: 0,
      completedJobs: 0,
      hourlyRate: 300,
      profileImage: user.avatar || '',
      phone: user.phone || '',
      email: user.email,
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        unavailableDates: [],
      },
    };
    db.update((database) => {
      database.providers.push(profile!);
    });
  }

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Provider profile not found.' });
  }

  return res.json({ success: true, data: profile });
});

// GET /api/v1/providers/:id
router.get('/:id', (req, res: Response) => {
  const provider = db.get().providers.find((p) => p.id === req.params.id || p.userId === req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, message: 'Provider not found.' });
  }

  // Include their active services and reviews
  const services = db.get().services.filter((s) => s.providerId === provider.userId && s.isActive);
  const reviews = db.get().reviews.filter((r) => r.providerId === provider.userId);

  return res.json({
    success: true,
    data: {
      ...provider,
      services,
      reviews,
    },
  });
});

// PATCH /api/v1/providers/me - Update current provider profile
router.patch('/me', requireAuth, requireRole('provider', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { businessName, bio, experienceYears, serviceAreas, hourlyRate, availability, phone } = req.body;

  let updatedProfile: ProviderProfile | undefined;

  db.update((database) => {
    let p = database.providers.find((item) => item.userId === user.id);
    if (!p) {
      p = {
        id: `prov_${Date.now()}`,
        userId: user.id,
        businessName: businessName || `${user.name}'s Services`,
        bio: bio || '',
        experienceYears: Number(experienceYears) || 1,
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : ['Delhi NCR'],
        verificationStatus: 'verified',
        rating: 5.0,
        reviewsCount: 0,
        completedJobs: 0,
        hourlyRate: Number(hourlyRate) || 300,
        profileImage: user.avatar || '',
        phone: phone || user.phone || '',
        email: user.email,
        availability: availability || {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
          unavailableDates: [],
        },
      };
      database.providers.push(p);
      updatedProfile = p;
    } else {
      if (businessName !== undefined) p.businessName = businessName.trim();
      if (bio !== undefined) p.bio = bio.trim();
      if (experienceYears !== undefined) p.experienceYears = Number(experienceYears);
      if (serviceAreas !== undefined) p.serviceAreas = Array.isArray(serviceAreas) ? serviceAreas : [serviceAreas];
      if (hourlyRate !== undefined) p.hourlyRate = Number(hourlyRate);
      if (phone !== undefined) p.phone = phone.trim();
      if (availability !== undefined) p.availability = availability;
      updatedProfile = p;
    }
  });

  return res.json({
    success: true,
    message: 'Provider profile updated successfully.',
    data: updatedProfile,
  });
});

export default router;
