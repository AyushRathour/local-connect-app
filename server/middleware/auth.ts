import { Request, Response, NextFunction } from 'express';
import { db, User } from '../db';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    // If no token, continue without req.user
    return next();
  }

  // Token format: "usr_xxx" or "demo_xxx"
  const user = db.get().users.find((u) => u.id === token || `token_${u.id}` === token);
  if (user) {
    req.user = user;
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to access this resource.',
    });
  }

  if (req.user.accountStatus === 'suspended') {
    return res.status(403).json({
      success: false,
      message: 'Account is suspended. Please contact platform support.',
    });
  }

  next();
}

export function requireRole(...roles: Array<'customer' | 'provider' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}].`,
      });
    }

    next();
  };
}
