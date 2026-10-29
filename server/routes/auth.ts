import { Router, Response } from 'express';
import { db, User } from '../db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', (req, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const assignedRole: 'customer' | 'provider' | 'admin' =
      role === 'admin' ? 'admin' : role === 'provider' ? 'provider' : 'customer';

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.get().users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : undefined,
      role: assignedRole,
      passwordHash: password, // In production production-ready password hash
      accountStatus: 'active',
      avatar: assignedRole === 'provider' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: now,
      updatedAt: now,
    };

    db.update((database) => {
      database.users.push(newUser);

      // If provider, create corresponding provider profile
      if (assignedRole === 'provider') {
        database.providers.push({
          id: `prov_${Date.now()}`,
          userId: newUser.id,
          businessName: `${newUser.name}'s Professional Services`,
          bio: 'Verified local service specialist providing premium residential and commercial service.',
          experienceYears: 3,
          serviceAreas: ['New Delhi', 'Delhi NCR'],
          verificationStatus: 'verified',
          rating: 5.0,
          reviewsCount: 0,
          completedJobs: 0,
          hourlyRate: 350,
          profileImage: newUser.avatar!,
          phone: newUser.phone || '+91 98765 00000',
          email: newUser.email,
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
            unavailableDates: [],
          },
        });
      }

      // Add welcoming notification
      database.notifications.push({
        id: `notif_${Date.now()}`,
        userId: newUser.id,
        title: 'Welcome to LocalServices!',
        message: 'Your account is active. Explore verified local services or configure your profile.',
        type: 'system',
        isRead: false,
        createdAt: now,
      });
    });

    const token = `token_${newUser.id}`;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar,
        accountStatus: newUser.accountStatus,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/v1/auth/login
router.post('/login', (req, res: Response) => {
  try {
    const { emailOrPhone, email, password } = req.body;
    const identifier = (emailOrPhone || email || '').toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number and password.',
      });
    }

    const user = db.get().users.find((u) => {
      const matchEmail = u.email.toLowerCase() === identifier;
      const matchPhone = u.phone && u.phone.replace(/\D/g, '') === identifier.replace(/\D/g, '');
      return matchEmail || matchPhone;
    });

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/phone and password.',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform support.',
      });
    }

    const token = `token_${user.id}`;

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/v1/auth/logout
router.post('/logout', (_req, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', (req, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const user = db.get().users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    // Return standard security response without leaking user existence
    return res.json({
      success: true,
      message: 'If an account with that email exists, reset instructions have been dispatched.',
    });
  }

  return res.json({
    success: true,
    message: `Password reset link generated for ${user.email}. (Demo reset token: reset_${user.id}_demo)`,
    demoToken: `reset_${user.id}_demo`,
  });
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', (req, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password are required.' });
  }

  // Find user by token
  const userId = token.replace('reset_', '').replace('_demo', '');
  const user = db.get().users.find((u) => u.id === userId);

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }

  db.update((database) => {
    const target = database.users.find((u) => u.id === userId);
    if (target) {
      target.passwordHash = newPassword;
      target.updatedAt = new Date().toISOString();
    }
  });

  return res.json({
    success: true,
    message: 'Password updated successfully. You can now log in with your new credentials.',
  });
});

// GET /api/v1/auth/demo-switch/:role
router.get('/demo-switch/:role', (req, res: Response) => {
  const role = req.params.role;
  let targetUser: User | undefined;

  if (role === 'provider') {
    targetUser = db.get().users.find((u) => u.id === 'usr_provider_1'); // Rahul Singh
  } else if (role === 'admin') {
    targetUser = db.get().users.find((u) => u.role === 'admin'); // Admin
  } else {
    targetUser = db.get().users.find((u) => u.id === 'usr_customer_1'); // John Doe
  }

  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'Demo user not found' });
  }

  const token = `token_${targetUser.id}`;
  return res.json({
    success: true,
    token,
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone,
      role: targetUser.role,
      avatar: targetUser.avatar,
      accountStatus: targetUser.accountStatus,
    },
  });
});

export default router;
