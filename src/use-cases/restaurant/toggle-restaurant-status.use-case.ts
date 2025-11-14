import { prisma } from "@/lib/prisma.js";
import { Restaurant } from "@prisma/client";

// O "data" que este Use Case espera
interface ToggleRestaurantStatusRequest {
  restaurantId: string;
  isOpen: boolean;
  userId: string;
}

export class ToggleRestaurantStatusUseCase {
  async execute({
    restaurantId,
    isOpen,
    userId,
  }: ToggleRestaurantStatusRequest): Promise<Restaurant> {
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    if (restaurant.userId !== userId) {
      throw new Error("Não autorizado.");
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: {
        id: restaurantId,
      },
      data: {
        isOpen: isOpen,
      },
    });

    return updatedRestaurant;
  }
}
