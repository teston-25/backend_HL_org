import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple Prisma instances in dev with hot reload
  var prisma: PrismaClient | undefined;
}

// Use the existing instance if it exists, otherwise create a new one
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // optional: logs queries (helpful in dev)
  });

// Store globally (only in dev) to prevent multiple instances
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
