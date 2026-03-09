import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import catchAsync from "../services/catchAsync";
import AppError from "../services/AppError";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  admin?: {
    id: number;
    email: string;
    role: string;
  };
}

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" },
  );

  res.json({
    status: "success",
    token,
    data: {
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});

export const getAdmins = catchAsync(async (req: AuthRequest, res: Response) => {
  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      created_at: true,
      updated_at: true,
    },
  });

  res.json({
    status: "success",
    result: admins.length,
    data: { admins },
  });
});

export const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, password, role = "ADMIN" } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  // Prevent creating multiple Super Admins
  if (role === "SUPER_ADMIN") {
    const existingSuperAdmin = await prisma.admin.findFirst({
      where: { role: "SUPER_ADMIN" },
    });
    if (existingSuperAdmin) {
      throw new AppError("Only one Super Admin is allowed", 400);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: { email, password_hash: hashedPassword, role },
    select: {
      id: true,
      email: true,
      role: true,
      created_at: true,
      updated_at: true,
    },
  });

  res.status(201).json({
    status: "success",
    data: { admin },
  });
});

export const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, role } = req.body;

  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  // Prevent creating multiple Super Admins
  if (role === "SUPER_ADMIN") {
    const existingSuperAdmin = await prisma.admin.findFirst({
      where: { role: "SUPER_ADMIN" },
    });
    if (existingSuperAdmin && existingSuperAdmin.id !== parseInt(id)) {
      throw new AppError("Only one Super Admin is allowed", 400);
    }
  }

  const admin = await prisma.admin.update({
    where: { id: parseInt(id) },
    data: { email, role },
    select: { id: true, email: true, role: true, updated_at: true },
  });

  res.json({
    status: "success",
    data: { admin },
  });
});

export const deleteAdmin = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const adminId = parseInt(id);

    // Prevent Super Admin from deleting themselves
    if (req.admin!.id === adminId) {
      throw new AppError("Cannot delete your own account", 400);
    }

    const adminToDelete = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!adminToDelete) {
      throw new AppError("Admin not found", 404);
    }

    // Prevent deleting the last Super Admin
    if (adminToDelete.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.admin.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (superAdminCount <= 1) {
        throw new AppError("Cannot delete the last Super Admin", 400);
      }
    }

    await prisma.admin.delete({ where: { id: adminId } });

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

export const updateMyPassword = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError("Current password and new password are required", 400);
    }

    if (!req.admin) {
      throw new AppError("Authentication required", 401);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });
    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password_hash,
    );
    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.admin.update({
      where: { id: req.admin.id },
      data: { password_hash: hashedNewPassword },
    });

    res.json({
      status: "success",
      message: "Password updated successfully",
    });
  },
);
