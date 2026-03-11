import { Request, Response } from "express";
import catchAsync from "../services/catchAsync";
import * as donationService from "../services/donationService";

export const getAllDonations = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const result = await donationService.getAllDonations(page, limit, status);

    res.json({
      status: "success",
      data: result,
    });
  },
);

export const getDonationStats = catchAsync(
  async (req: Request, res: Response) => {
    const stats = await donationService.getDonationStats();

    res.json({
      status: "success",
      data: stats,
    });
  },
);
