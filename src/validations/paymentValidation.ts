import { z } from "zod";

export const initPaymentSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .positive("Amount must be greater than 0"),

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
    .regex(/^09\d{8}$/, "Phone number must be a valid Ethiopian number")
    .optional(),

  title: z.string().max(100, "Title too long").optional(),

  description: z.string().max(255, "Description too long").optional(),
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
