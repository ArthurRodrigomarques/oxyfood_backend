import { prisma } from "@/lib/prisma.js";

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
        categories: {
          orderBy: {
            orderIndex: "asc",
          },
          include: {
            products: {
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

    return { restaurant };
  }
}
