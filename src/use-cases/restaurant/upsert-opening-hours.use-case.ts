import { prisma } from "@/lib/prisma.js";

interface ScheduleItem {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

interface UpsertOpeningHoursRequest {
  restaurantId: string;
  schedules: ScheduleItem[];
}

export class UpsertOpeningHoursUseCase {
  async execute({ restaurantId, schedules }: UpsertOpeningHoursRequest) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    await prisma.openingHour.deleteMany({
      where: { restaurantId },
    });

    if (schedules.length > 0) {
      await prisma.openingHour.createMany({
        data: schedules.map((s) => ({
          restaurantId,
          dayOfWeek: s.dayOfWeek,
          openTime: s.openTime,
          closeTime: s.closeTime,
        })),
      });
    }

    return await prisma.openingHour.findMany({
      where: { restaurantId },
      orderBy: { dayOfWeek: "asc" },
    });
  }
}
