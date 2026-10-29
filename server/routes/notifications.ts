import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/v1/notifications
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifs = db.get().notifications.filter((n) => n.userId === user.id);
  notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ success: true, data: notifs });
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifId = req.params.id;

  db.update((database) => {
    const n = database.notifications.find((item) => item.id === notifId && item.userId === user.id);
    if (n) {
      n.isRead = true;
    }
  });

  return res.json({ success: true });
});

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.update((database) => {
    database.notifications.forEach((n) => {
      if (n.userId === user.id) {
        n.isRead = true;
      }
    });
  });
  return res.json({ success: true });
});

export default router;
