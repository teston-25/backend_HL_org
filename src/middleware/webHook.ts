import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import AppError from "../services/AppError";

export const verifyChapaWebhook = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const secret = process.env.CHAPA_WEBHOOK_SECRET;

  if (!secret) {
    throw new AppError("Webhook secret not configured", 500);
  }

  const chapaSignature = req.headers["chapa-signature"] as string | undefined;
  const xChapaSignature = req.headers["x-chapa-signature"] as
    | string
    | undefined;

  if (!chapaSignature && !xChapaSignature) {
    throw new AppError("Missing webhook signature", 401);
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  // Check if either header matches
  const isValid =
    (chapaSignature && timingSafeEqual(hash, chapaSignature)) ||
    (xChapaSignature && timingSafeEqual(hash, xChapaSignature));

  if (!isValid) {
    throw new AppError("Invalid webhook signature", 401);
  }

  next();
};

// Prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
