import { Request, Response, NextFunction } from "express";

// simple async wrapper – catches rejected promises and passes error to next()
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
