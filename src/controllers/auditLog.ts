import { Request, Response } from "express";
import prisma from "../config/prisma";
import catchAsync from "../services/catchAsync";

export const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const action = req.query.action as string;
  const entity = req.query.entity as string;
  const adminId = req.query.adminId as string;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (adminId) where.adminId = parseInt(adminId);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        admin: {
          select: { id: true, email: true, role: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({
    status: "success",
    data: {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    },
  });
});
