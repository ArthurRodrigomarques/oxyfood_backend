import { prisma } from "@/lib/prisma.js";

export class CheckExpiredSubscriptionsUseCase {
  async execute() {
    const now = new Date();

    const expiredRestaurants = await prisma.restaurant.findMany({
      where: {
        subscriptionStatus: "ACTIVE",
        planExpiresAt: {
          lt: now,
        },
        plan: {
          not: "ENTERPRISE",
        },
      },
      select: {
        id: true,
        name: true,
        planExpiresAt: true,
      },
    });

    if (expiredRestaurants.length === 0) {
      return {
        processedAt: now,
        inactivatedCount: 0,
        deactivatedStores: [],
      };
    }

    const idsToUpdate = expiredRestaurants.map((r) => r.id);

    await prisma.restaurant.updateMany({
      where: {
        id: {
          in: idsToUpdate,
        },
      },
      data: {
        subscriptionStatus: "INACTIVE",
        isOpen: false,
      },
    });

    return {
      processedAt: now,
      inactivatedCount: expiredRestaurants.length,
      deactivatedStores: expiredRestaurants,
    };
  }
}
