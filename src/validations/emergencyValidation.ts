import { z } from "zod";

export const createEmergencySchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title cannot exceed 150 characters"),

  location: z
    .string()
    .min(2, "Location is required")
    .max(100, "Location cannot exceed 100 characters"),

  description: z.string().min(10, "Description must be at least 10 characters"),

  status: z.enum(["ACTIVE", "INACTIVE", "RESOLVED"]).optional(),

  affected_count: z
    .number()
    .int()
    .nonnegative("Affected count cannot be negative")
    .optional(),

  raised_amount: z
    .number()
    .nonnegative("Raised amount cannot be negative")
    .optional(),

  goal_amount: z
    .number()
    .nonnegative("Goal amount cannot be negative")
    .optional(),

  aid_deployed: z
    .number()
    .nonnegative("Aid deployed cannot be negative")
    .optional(),

  aid_unit: z.string().max(50, "Aid unit too long").optional(),

  image_url: z.string().url("Image must be a valid URL").optional(),
});

export const updateEmergencySchema = createEmergencySchema.partial().extend({
  increment_amount: z
    .number()
    .positive("Increment amount must be greater than 0")
    .optional(),
});
