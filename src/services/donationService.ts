import prisma from "../config/prisma";

export async function getAllDonations(
  page: number = 1,
  limit: number = 10,
  status?: string,
) {
  const skip = (page - 1) * limit;

  // Filter by status if provided
  const where = status ? { status } : {};

  // Get total count
  const total = await prisma.donation.count({ where });

  // Get paginated donations
  const donations = await prisma.donation.findMany({
    where,
    orderBy: { created_at: "desc" },
    skip,
    take: limit,
  });

  // Get summary of completed donations
  const summary = await prisma.donation.aggregate({
    where: { status: "completed" },
    _sum: { amount: true },
    _count: true,
  });

  return {
    donations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      totalAmount: summary._sum.amount || 0,
      totalDonations: summary._count,
    },
  };
}

export async function getDonationStats() {
  // Total stats
  const totalStats = await prisma.donation.aggregate({
    _sum: { amount: true },
    _count: true,
  });

  // Stats by status
  const byStatus = await prisma.donation.groupBy({
    by: ["status"],
    _count: true,
    _sum: { amount: true },
  });

  // Recent 5 donations
  const recentDonations = await prisma.donation.findMany({
    where: { status: "completed" },
    orderBy: { created_at: "desc" },
    take: 5,
    select: {
      id: true,
      amount: true,
      email: true,
      first_name: true,
      last_name: true,
      created_at: true,
      status: true,
    },
  });

  return {
    overview: {
      totalDonations: totalStats._count,
      totalAmount: totalStats._sum.amount || 0,
      averageDonation:
        totalStats._count > 0
          ? (totalStats._sum.amount || 0) / totalStats._count
          : 0,
    },
    byStatus,
    recentDonations,
  };
}
