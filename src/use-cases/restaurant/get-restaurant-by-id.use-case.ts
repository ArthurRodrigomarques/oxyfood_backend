import { prisma } from "@/lib/prisma.js";
import { Restaurant } from "@prisma/client";

interface GetRestaurantByIdRequest {
  restaurantId: string;
}

export class GetRestaurantByIdUseCase {
  async execute({
    restaurantId,
  }: GetRestaurantByIdRequest): Promise<Restaurant> {
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    return restaurant;
  }
}
