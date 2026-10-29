import { Router, Response } from 'express';
import { db, Service } from '../db';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/v1/services - search, filter, paginate, sort
router.get('/', (req, res: Response) => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = '1',
      limit = '12',
    } = req.query;

    let services = [...db.get().services];

    // Filter active services for public unless admin
    services = services.filter((s) => s.isActive);

    // Search keyword
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      services = services.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.categoryName.toLowerCase().includes(q) ||
          s.providerName.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'all') {
      const cat = category.toLowerCase().trim();
      services = services.filter(
        (s) => s.categoryId.toLowerCase() === cat || s.categoryName.toLowerCase() === cat
      );
    }

    // Location / service area filter
    if (location && typeof location === 'string' && location.trim() !== '') {
      const loc = location.toLowerCase().trim();
      services = services.filter(
        (s) => s.serviceArea.toLowerCase().includes(loc) || loc.includes(s.serviceArea.toLowerCase())
      );
    }

    // Price range
    if (minPrice && !isNaN(Number(minPrice))) {
      services = services.filter((s) => s.price >= Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      services = services.filter((s) => s.price <= Number(maxPrice));
    }

    // Rating
    if (minRating && !isNaN(Number(minRating))) {
      services = services.filter((s) => s.rating >= Number(minRating));
    }

    // Sorting
    if (sort === 'price_asc') {
      services.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      services.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating_desc') {
      services.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: relevance / rating
      services.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    }

    const total = services.length;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedServices = services.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      data: paginatedServices,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error('Services GET error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve services.' });
  }
});

// GET /api/v1/services/:id
router.get('/:id', (req, res: Response) => {
  const service = db.get().services.find((s) => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  // Also include provider details and related services
  const provider = db.get().providers.find((p) => p.userId === service.providerId);
  const relatedServices = db
    .get()
    .services.filter((s) => s.categoryId === service.categoryId && s.id !== service.id && s.isActive)
    .slice(0, 3);

  const reviews = db.get().reviews.filter((r) => r.serviceId === service.id);

  return res.json({
    success: true,
    data: {
      ...service,
      providerProfile: provider || null,
      reviews,
      relatedServices,
    },
  });
});

// POST /api/v1/services - Create new service (Provider only)
router.post('/', requireAuth, requireRole('provider', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, categoryId, description, price, durationMinutes, serviceArea, image } = req.body;
    const user = req.user!;

    if (!title || !categoryId || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, description, and price are required.',
      });
    }

    const category = db.get().categories.find((c) => c.id === categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Selected category does not exist.' });
    }

    const now = new Date().toISOString();
    const newService: Service = {
      id: `srv_${Date.now()}`,
      providerId: user.id,
      providerName: user.name,
      providerAvatar: user.avatar,
      categoryId: category.id,
      categoryName: category.name,
      title: title.trim(),
      description: description.trim(),
      price: Math.max(0, Number(price)),
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
      serviceArea: serviceArea || 'Citywide',
      rating: 5.0,
      reviewsCount: 0,
      image:
        image ||
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    db.update((database) => {
      database.services.unshift(newService);
    });

    return res.status(201).json({
      success: true,
      message: 'Service published successfully.',
      data: newService,
    });
  } catch (error) {
    console.error('Service create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// PATCH /api/v1/services/:id - Update service
router.patch('/:id', requireAuth, requireRole('provider', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const serviceId = req.params.id;
    const user = req.user!;
    const existing = db.get().services.find((s) => s.id === serviceId);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    // Role check: Only provider owner or admin can edit
    if (user.role !== 'admin' && existing.providerId !== user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this service.' });
    }

    const { title, categoryId, description, price, durationMinutes, serviceArea, isActive, image } =
      req.body;

    let updatedService: Service | undefined;

    db.update((database) => {
      const s = database.services.find((item) => item.id === serviceId);
      if (s) {
        if (title !== undefined) s.title = title.trim();
        if (description !== undefined) s.description = description.trim();
        if (price !== undefined) s.price = Number(price);
        if (durationMinutes !== undefined) s.durationMinutes = Number(durationMinutes);
        if (serviceArea !== undefined) s.serviceArea = serviceArea;
        if (isActive !== undefined) s.isActive = Boolean(isActive);
        if (image !== undefined) s.image = image;

        if (categoryId) {
          const cat = database.categories.find((c) => c.id === categoryId);
          if (cat) {
            s.categoryId = cat.id;
            s.categoryName = cat.name;
          }
        }

        s.updatedAt = new Date().toISOString();
        updatedService = s;
      }
    });

    return res.json({
      success: true,
      message: 'Service updated successfully.',
      data: updatedService,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
});

// DELETE /api/v1/services/:id
router.delete('/:id', requireAuth, requireRole('provider', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const serviceId = req.params.id;
  const user = req.user!;
  const existing = db.get().services.find((s) => s.id === serviceId);

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  if (user.role !== 'admin' && existing.providerId !== user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this service.' });
  }

  db.update((database) => {
    database.services = database.services.filter((s) => s.id !== serviceId);
  });

  return res.json({
    success: true,
    message: 'Service deleted successfully.',
  });
});

export default router;
