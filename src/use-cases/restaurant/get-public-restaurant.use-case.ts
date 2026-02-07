import { prisma } from "@/lib/prisma.js";
import { isRestaurantOpen } from "@/lib/utils.js";

interface GetPublicRestaurantRequest {
  slug: string;
}

export class GetPublicRestaurantUseCase {
  async execute({ slug }: GetPublicRestaurantRequest) {
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug,
      },
      include: {
        openingHours: true,
        categories: {
          orderBy: {
            orderIndex: "asc",
          },
          include: {
            products: {
              where: {
                deletedAt: null,
                available: true,
              },
              include: {
                optionGroups: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }
    const isOpenCalculated = isRestaurantOpen(restaurant.openingHours);

    return {
      restaurant: {
        ...restaurant,
        isOpen: isOpenCalculated,
      },
    };
  }
}
