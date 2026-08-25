import { Request, Response, NextFunction } from "express";
import axios from "axios";
import catchAsync from "../services/catchAsync";
import AppError from "../services/AppError";

const ALLOWED_HOSTS = new Set(["res.cloudinary.com"]);
const MAX_BYTES = 10 * 1024 * 1024;

export const proxyImage = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const raw = typeof req.query.url === "string" ? req.query.url : "";
    if (!raw) throw new AppError("Missing url query parameter", 400);

    let target: URL;
    try {
      target = new URL(raw);
    } catch {
      throw new AppError("Invalid url", 400);
    }

    if (
      target.protocol !== "https:" ||
      !ALLOWED_HOSTS.has(target.hostname)
    ) {
      throw new AppError("Host not allowed", 400);
    }

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const upstream = await axios.get(target.href, {
      responseType: "arraybuffer",
      timeout: 20000,
      maxContentLength: MAX_BYTES,
    });

    const contentType =
      (upstream.headers["content-type"] as string) || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      throw new AppError("Not an image", 400);
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(upstream.data);
  },
);
