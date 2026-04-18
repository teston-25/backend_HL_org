import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: any, property: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[property]);
      req[property] = parsed;
      next();
    } catch (error: any) {
      console.log("Error object:", error);
      if (!error.issues) {
        console.error("Non-validation error:", error);
        return res.status(400).json({
          status: "fail",
          message: error.message || "Validation failed",
        });
      }
      console.error("Validation error:", error.issues);
      const formattedErrors = error.issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({
        status: "fail",
        errors: formattedErrors,
      });
    }
  };
