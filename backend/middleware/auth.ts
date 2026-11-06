import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      email: string;
      role: 'admin' | 'hr' | 'employee';
      employeeId?: number;
      employeeCode?: string;
      fullName?: string;
    };
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }
  next();
}

export function requireRoles(...allowedRoles: Array<'admin' | 'hr' | 'employee'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.session.user.role}' lacks permission for this action.`,
      });
    }
    next();
  };
}
