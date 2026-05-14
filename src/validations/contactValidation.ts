import { z } from "zod";
import { isEmailDeliverable } from "./emailValidation";

export const contactSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name cannot exceed 100 characters"),

    email: z.string().email("Invalid email format").optional(),

    phone_number: z
      .string()
      .regex(
        /^(\+251|0)\d{9}$/,
        "Please provide a valid Ethiopian phone number",
      )
      .optional()
      .or(z.literal("")),

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
        "complaint",
        "press/media",
      ])
      .default("general inquiry"),
  })
  .refine((data) => data.email || data.phone_number, {
    message: "Either email or phone number must be provided",
    path: ["email"],
  })
  .superRefine(async (data, ctx) => {
    if (data.email) {
      const deliverable = await isEmailDeliverable(data.email);
      if (!deliverable) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "The email address you provided may not be valid. Please check and try again.",
          path: ["email"],
        });
      }
    }
  });

export type ContactInput = z.infer<typeof contactSchema>;
