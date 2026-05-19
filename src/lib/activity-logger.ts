import prisma from "./prisma";

export async function logActivity({
  action,
  entityType,
  entityId,
  details,
  userId,
}: {
  action: string;
  entityType: string;
  entityId: string;
  details?: string | null;
  userId?: string | null;
}) {
  try {
    const log = await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        details,
        userId,
      },
    });
    return log;
  } catch (error) {
    console.error("Failed to create activity log:", error);
    // Don't throw the error, we don't want to crash the main operation just because logging failed
    return null;
  }
}

export async function getActivityLogs(limit: number = 50, offset: number = 0) {
  return prisma.activityLog.findMany({
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function getActivityLogsByEntity(entityType: string, entityId: string) {
  return prisma.activityLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}
