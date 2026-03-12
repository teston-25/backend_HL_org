import { Request, Response } from "express";
import prisma from "../config/prisma";
import catchAsync from "../services/catchAsync";
import AppError from "../services/AppError";

export const createEmergency = catchAsync(
  async (req: Request, res: Response) => {
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

    res.status(201).json({
      status: "success",
      message: "Emergency created successfully",
      data: { emergency },
    });
  },
);

export const getEmergencies = catchAsync(
  async (req: Request, res: Response) => {
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
  async (req: Request, res: Response) => {
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
  async (req: Request, res: Response) => {
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

    const emergency = await prisma.emergency.update({
      where: { id },
      data: updateData,
    });

    res.json({
      status: "success",
      message: "Emergency updated successfully",
      data: { emergency },
    });
  },
);

export const deleteEmergency = catchAsync(
  async (req: Request, res: Response) => {
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

    res.status(204).json({
      status: "success",
      message: "Emergency deleted successfully",
    });
  },
);
