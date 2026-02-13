import { prisma } from "@/lib/prisma.js";

interface GetAdminMenuRequest {
  restaurantId: string;
  userId: string;
}

export class GetAdminMenuUseCase {
  async execute({ restaurantId, userId }: GetAdminMenuRequest) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    if (restaurant.userId !== userId) {
      throw new Error("Não autorizado.");
    }

    const categories = await prisma.category.findMany({
      where: { restaurantId },
      orderBy: { orderIndex: "asc" },
      include: {
        products: {
          where: {
            deletedAt: null,
          },
          orderBy: { createdAt: "desc" },
          include: {
            optionGroups: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    return { categories };
  }
}
