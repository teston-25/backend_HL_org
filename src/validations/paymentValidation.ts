import { z } from "zod";
import { isEmailDeliverable } from "./emailValidation";

export const initPaymentSchema = z
  .object({
    amount: z.number().positive("Amount must be greater than 0"),

    email: z.string().email("Invalid email format"),

    first_name: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .optional(),

    last_name: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .optional(),

    phone_number: z
      .string()
      .regex(
        /^(\+251|251|0)9\d{8}$|^(\+1|1)?[2-9]\d{9}$/,
        "Phone number must be a valid",
      )
      .optional(),

    title: z.string().max(100, "Title too long").optional(),

    description: z.string().max(255, "Description too long").optional(),
  })
  .superRefine(async (data, ctx) => {
    const deliverable = await isEmailDeliverable(data.email);
    if (!deliverable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "The email address you provided may not be valid. Please check and try again.",
        path: ["email"],
      });
    }
  });

export const verifyPaymentSchema = z.object({
  tx_ref: z.string().min(5, "Transaction reference is required"),
});

export const callbackSchema = z.object({
  trx_ref: z.string(),
  ref_id: z.string().optional(),
  status: z.enum(["success", "failed", "pending"]),
});

export const getTransactionSchema = z.object({
  tx_ref: z.string(),
});
