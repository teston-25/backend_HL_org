import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../services/AppError";

interface AuthRequest extends Request {
  admin?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") || req.cookies?.accessToken;
    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      email: string;
      role: string;
    };

    req.admin = decoded;
    next();
  } catch (error) {
    next(new AppError("Invalid token", 401));
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AppError("Authentication required", 401));
    }

    // Convert single role to array for consistent handling
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.admin.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }

    next();
  };
};
