import { prisma } from "@/lib/prisma.js";

export class CheckExpiredSubscriptionsUseCase {
  async execute() {
    const now = new Date();
    const expiredStores = await prisma.restaurant.findMany({
      where: {
        subscriptionStatus: "ACTIVE",
        planExpiresAt: {
          lt: now,
        },
      },
      select: {
        id: true,
        name: true,
        planExpiresAt: true,
      },
    });

    if (expiredStores.length === 0) {
      return {
        processedAt: now.toISOString(),
        inactivatedCount: 0,
        deactivatedStores: [],
      };
    }
    const expiredIds = expiredStores.map((store) => store.id);

    await prisma.restaurant.updateMany({
      where: {
        id: {
          in: expiredIds,
        },
      },
      data: {
        subscriptionStatus: "OVERDUE",
      },
    });

    return {
      processedAt: now.toISOString(),
      inactivatedCount: expiredStores.length,
      deactivatedStores: expiredStores.map((store) => ({
        id: store.id,
        name: store.name,
        planExpiresAt: store.planExpiresAt?.toISOString(),
      })),
    };
  }
}
