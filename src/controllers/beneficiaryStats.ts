import { Request, Response } from "express";
import prisma from "../config/prisma";
import catchAsync from "../services/catchAsync";
import AppError from "../services/AppError";
import { createAuditLog } from "../services/auditLog";

interface AuthRequest extends Request {
  admin?: {
    id: number;
    email: string;
    role: string;
  };
}

export const getBeneficiaryStats = catchAsync(
  async (req: Request, res: Response) => {
    let stats = await prisma.beneficiaryStats.findFirst();

    // If stats do not exist, create them automatically
    if (!stats) {
      console.log("Get Beneficary stats:", stats);
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
  async (req: AuthRequest, res: Response) => {
    console.log("BODY:", req.body);

    const existing = await prisma.beneficiaryStats.findFirst();
    console.log("EXISTING:", existing);

    if (!existing) {
      throw new AppError("Stats not found", 404);
    }

    const stats = await prisma.beneficiaryStats.update({
      where: { id: existing.id },
      data: req.body,
    });

    // Log the update action
    if (req.admin) {
      await createAuditLog(
        req.admin.id,
        "UPDATE",
        "BeneficiaryStats",
        existing.id,
        `Updated beneficiary stats: ${JSON.stringify(req.body)}`,
      );
    }

    res.json({ status: "success", data: { stats } });
  },
);
