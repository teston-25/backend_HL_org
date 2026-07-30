import { Request, Response, NextFunction } from "express";

export const cacheControl = (maxAge: number, staleWhileRevalidate = 60) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "GET") {
      res.setHeader(
        "Cache-Control",
        `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      );
    } else {
      res.setHeader("Cache-Control", "no-store");
    }
    next();
  };
