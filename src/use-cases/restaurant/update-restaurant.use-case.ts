import { prisma } from "@/lib/prisma.js";
import { Restaurant } from "@prisma/client";

interface UpdateRestaurantRequest {
  restaurantId: string;
  userId: string;
  name?: string;
  description?: string;
  addressText?: string;
  phoneNumber?: string;
  deliveryFee?: number;
  freeDeliveryAbove?: number | null;
  pixKey?: string;
  mercadoPagoAccessToken?: string;
}

export class UpdateRestaurantUseCase {
  async execute({
    restaurantId,
    userId,
    ...data
  }: UpdateRestaurantRequest): Promise<Restaurant> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    if (restaurant.userId !== userId) {
      throw new Error("Não autorizado.");
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...data,
      },
    });

    return updatedRestaurant;
  }
}
