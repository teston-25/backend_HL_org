import rateLimit from "express-rate-limit";

export const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    status: "fail",
    message: "Too many login attempts. Try again in 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
