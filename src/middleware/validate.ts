import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: any, property: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[property]);
      next();
    } catch (error: any) {
      return res.status(400).json({
        status: "fail",
        errors: error.errors,
      });
    }
  };
