import { Router, Response } from 'express';
import { db, ContactMessage } from '../db';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/v1/contact - Public contact submission
router.post('/', (req, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required fields.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  const now = new Date().toISOString();
  const newMsg: ContactMessage = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : undefined,
    subject: subject ? subject.trim() : 'General Inquiry',
    message: message.trim(),
    status: 'unread',
    createdAt: now,
  };

  db.update((database) => {
    database.contactMessages.unshift(newMsg);

    // Notify all admins
    const admins = database.users.filter((u) => u.role === 'admin');
    admins.forEach((admin) => {
      database.notifications.unshift({
        id: `notif_${Date.now()}_${admin.id}`,
        userId: admin.id,
        title: 'New Contact Message',
        message: `${newMsg.name} sent a message: "${newMsg.subject}"`,
        type: 'system',
        isRead: false,
        link: '/admin/dashboard',
        createdAt: now,
      });
    });
  });

  return res.status(201).json({
    success: true,
    message: 'Thank you for contacting LocalServices. Our support team will respond within 24 business hours.',
    data: newMsg,
  });
});

// GET /api/v1/contact/messages (Admin only)
router.get('/messages', requireAuth, requireRole('admin'), (_req, res: Response) => {
  const messages = db.get().contactMessages;
  return res.json({ success: true, data: messages });
});

// PATCH /api/v1/contact/messages/:id (Admin only)
router.patch('/messages/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const msgId = req.params.id;

  let updated: ContactMessage | undefined;
  db.update((database) => {
    const m = database.contactMessages.find((item) => item.id === msgId);
    if (m) {
      m.status = status;
      updated = m;
    }
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Message not found.' });
  }

  return res.json({ success: true, data: updated });
});

export default router;
