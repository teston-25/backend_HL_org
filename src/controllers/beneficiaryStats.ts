import { Request, Response } from "express";
import prisma from "../config/prisma";
import catchAsync from "../services/catchAsync";
import AppError from "../services/AppError";

export const getBeneficiaryStats = catchAsync(
  async (req: Request, res: Response) => {
    let stats = await prisma.beneficiaryStats.findFirst();

    // If stats do not exist, create them automatically
    if (!stats) {
      stats = await prisma.beneficiaryStats.create({
        data: {
          total_beneficiaries: 0,
          countries_count: 0,
          water_projects: 0,
        },
      });
    }

    res.json({
      status: "success",
      data: { stats },
    });
  },
);

export const updateBeneficiaryStats = catchAsync(
  async (req: Request, res: Response) => {
    const updateData = req.body;
    const stats = await prisma.beneficiaryStats.update({
      where: { id: 1 }, // assume single record
      data: updateData,
    });
    res.json({ status: "success", data: { stats } });
  },
);
