// validations/contactValidation.ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),

  email: z.string().email("Please provide a valid email address"),

  subject: z
    .string()
    .max(200, "Subject cannot exceed 200 characters")
    .optional()
    .nullable(),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(5000, "Message cannot exceed 5000 characters"),

  type: z
    .enum([
      "general inquiry",
      "volunteering",
      "donations",
      "internship",
      "partnership",
      "feedback",
      "compliant",
      "press/media",
    ])
    .default("general inquiry")
    .optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
