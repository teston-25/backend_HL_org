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
  async (_req: Request, res: Response) => {
    let stats = await prisma.beneficiaryStats.findFirst();

    // If stats do not exist, create them automatically
    if (!stats) {
      console.log("Get Beneficary stats:", stats);
      stats = await prisma.beneficiaryStats.create({
        data: {
          total_beneficiaries: 0,
          international_referrals: 0,
          annual_target: 0,
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

    const updateData: Partial<{
      total_beneficiaries: number;
      international_referrals: number;
      annual_target: number;
    }> = {};

    if (req.body.total_beneficiaries !== undefined) {
      updateData.total_beneficiaries = Number(req.body.total_beneficiaries);
    }
    if (req.body.international_referrals !== undefined) {
      updateData.international_referrals = Number(
        req.body.international_referrals,
      );
    }
    if (req.body.annual_target !== undefined) {
      updateData.annual_target = Number(req.body.annual_target);
    }

    const stats = await prisma.beneficiaryStats.update({
      where: { id: existing.id },
      data: updateData,
    });

    // Log the update action
    if (req.admin) {
      await createAuditLog(
        req.admin.id,
        "UPDATE",
        "BeneficiaryStats",
        existing.id,
        `Updated beneficiary stats`,
      );
    }

    res.json({ status: "success", data: { stats } });
  },
);
