import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
});

export const updateAdminSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

export const deleteAdminSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const adminIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
