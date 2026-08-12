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

export const createEmergency = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const {
      title,
      location,
      description,
      status,
      affected_count,
      raised_amount,
      goal_amount,
      aid_deployed,
      aid_unit,
      image_url,
    } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const emergency = await prisma.emergency.create({
      data: {
        title,
        slug,
        location,
        description,
        status: status || "ACTIVE",
        affected_count: affected_count ? Number(affected_count) : null,
        raised_amount: raised_amount ? Number(raised_amount) : 0,
        goal_amount: goal_amount ? Number(goal_amount) : null,
        aid_deployed: aid_deployed ? Number(aid_deployed) : null,
        aid_unit,
        image_url,
      },
    });

    if (req.admin) {
      await createAuditLog(
        req.admin.id,
        "CREATE",
        "EMERGENCY",
        emergency.id,
        `Created emergency: ${title}`,
      );
    }

    res.status(201).json({
      status: "success",
      message: "Emergency created successfully",
      data: { emergency },
    });
  },
);

export const getEmergencies = catchAsync(
  async (_req: Request, res: Response) => {
    const [emergencies, stats] = await Promise.all([
      prisma.emergency.findMany({
        orderBy: { created_at: "desc" },
      }),

      prisma.emergency.aggregate({
        where: { status: "ACTIVE" },
        _sum: {
          raised_amount: true,
          goal_amount: true,
          affected_count: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    res.json({
      status: "success",
      data: {
        emergencies,
        stats: {
          activeEmergencies: stats._count._all,
          totalRaised: stats._sum.raised_amount ?? 0,
          totalGoal: stats._sum.goal_amount ?? 0,
          totalAffected: stats._sum.affected_count ?? 0,
        },
      },
    });
  },
);

export const getEmergencyById = catchAsync(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const emergency = await prisma.emergency.findUnique({
      where: { id },
    });

    if (!emergency) {
      throw new AppError("Emergency not found", 404);
    }

    res.json({
      status: "success",
      data: { emergency },
    });
  },
);

export const getActiveEmergencies = catchAsync(
  async (_req: Request, res: Response) => {
    // Fetch all emergencies with status ACTIVE
    const emergencies = await prisma.emergency.findMany({
      where: { status: "ACTIVE" },
      orderBy: { created_at: "desc" },
      take: 5, // optional: limit for homepage
    });

    // Return response
    res.json({
      status: "success",
      data: {
        emergencies,
        count: emergencies.length, // total active emergencies
      },
    });
  },
);

export const updateEmergency = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const updateData = req.body;

    const existingEmergency = await prisma.emergency.findUnique({
      where: { id },
    });

    if (!existingEmergency) {
      throw new AppError("Emergency not found", 404);
    }

    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    if (updateData.increment_amount) {
      updateData.raised_amount = {
        increment: Number(updateData.increment_amount),
      };
      delete updateData.increment_amount;
    }

    let emergency = await prisma.emergency.update({
      where: { id },
      data: updateData,
    });

    if (
      emergency.raised_amount != null &&
      emergency.goal_amount != null &&
      emergency.goal_amount > 0 &&
      emergency.raised_amount >= emergency.goal_amount &&
      emergency.status !== "RESOLVED"
    ) {
      emergency = await prisma.emergency.update({
        where: { id },
        data: { status: "RESOLVED" },
      });
    }

    if (req.admin) {
      await createAuditLog(
        req.admin.id,
        "UPDATE",
        "EMERGENCY",
        emergency.id,
        `Updated emergency: ${existingEmergency.title}`,
      );
    }

    res.json({
      status: "success",
      message:
        emergency.status === "RESOLVED" &&
        existingEmergency.status !== "RESOLVED"
          ? "Emergency auto-resolved — funding goal reached!"
          : "Emergency updated successfully",
      data: { emergency },
    });
  },
);

export const deleteEmergency = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);

    const emergency = await prisma.emergency.findUnique({
      where: { id },
    });

    if (!emergency) {
      throw new AppError("Emergency not found", 404);
    }

    await prisma.emergency.delete({
      where: { id },
    });

    if (req.admin) {
      await createAuditLog(
        req.admin.id,
        "DELETE",
        "EMERGENCY",
        id,
        `Deleted emergency: ${emergency.title}`,
      );
    }

    res.status(204).json({
      status: "success",
      message: "Emergency deleted successfully",
    });
  },
);
