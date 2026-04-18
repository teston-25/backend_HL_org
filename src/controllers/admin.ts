import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import catchAsync from "../services/catchAsync";
import AppError from "../services/AppError";
import { createAuditLog } from "../services/auditLog";

interface AuthRequest extends Request {
  admin?: {
    id: number;
    email: string;
    role: string;
  };
}

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

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

  await createAuditLog(admin.id, "LOGIN", "AUTH", admin.id, "Admin logged in");

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

export const createAdmin = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { email, password, role = "ADMIN" } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
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

    await createAuditLog(
      req.admin!.id,
      "CREATE",
      "ADMIN",
      admin.id,
      "Created new admin account",
    );

    res.status(201).json({
      status: "success",
      data: { admin },
    });
  },
);

export const updateAdmin = catchAsync(
  async (req: AuthRequest, res: Response) => {
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

    await createAuditLog(
      req.admin!.id,
      "UPDATE",
      "ADMIN",
      admin.id,
      "Updated admin account",
    );

    res.json({
      status: "success",
      data: { admin },
    });
  },
);

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

    await createAuditLog(
      req.admin!.id,
      "DELETE",
      "ADMIN",
      adminId,
      "Deleted admin account",
    );

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

    await createAuditLog(
      req.admin.id,
      "UPDATE",
      "ADMIN",
      req.admin.id,
      "Updated own password",
    );

    res.json({
      status: "success",
      message: "Password updated successfully",
    });
  },
);

// contact management for admin panel
export const getAllContacts = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.contact.count();

    // Get paginated contacts
    const contacts = await prisma.contact.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    });

    res.json({
      status: "success",
      data: {
        contacts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  },
);

export const getContact = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const contact = await prisma.contact.findUnique({
    where: { id: parseInt(id) },
  });

  if (!contact) {
    throw new AppError("Contact not found", 404);
  }

  res.json({
    status: "success",
    data: { contact },
  });
});

export const deleteContact = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.contact.delete({
    where: { id: parseInt(id) },
  });

  res.status(204).json({
    status: "success",
    message: "Contact deleted successfully",
  });
});
