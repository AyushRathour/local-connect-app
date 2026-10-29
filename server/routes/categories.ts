import { Router, Response } from 'express';
import { db, ServiceCategory } from '../db';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/v1/categories
router.get('/', (_req, res: Response) => {
  const categories = db.get().categories.filter((c) => c.isActive);
  return res.json({
    success: true,
    data: categories,
  });
});

// POST /api/v1/categories (Admin only)
router.post('/', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { name, icon, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required.' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat: ServiceCategory = {
    id: `cat_${Date.now()}`,
    name: name.trim(),
    slug,
    icon: icon || 'Briefcase',
    description: description || '',
    isActive: true,
  };

  db.update((database) => {
    database.categories.push(newCat);
  });

  return res.status(201).json({ success: true, data: newCat });
});

// PATCH /api/v1/categories/:id (Admin only)
router.patch('/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const catId = req.params.id;
  const { name, icon, description, isActive } = req.body;

  let updated: ServiceCategory | undefined;
  db.update((database) => {
    const c = database.categories.find((item) => item.id === catId);
    if (c) {
      if (name !== undefined) {
        c.name = name.trim();
        c.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      if (icon !== undefined) c.icon = icon;
      if (description !== undefined) c.description = description;
      if (isActive !== undefined) c.isActive = Boolean(isActive);
      updated = c;
    }
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  return res.json({ success: true, data: updated });
});

export default router;
