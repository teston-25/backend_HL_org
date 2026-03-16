import prisma from "../config/prisma";

export const createAuditLog = async (
  adminId: number,
  action: string,
  entity: string,
  entityId?: number,
  details?: string,
) => {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      entity,
      entityId,
      details,
    },
  });
};
