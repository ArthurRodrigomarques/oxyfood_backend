import { prisma } from "@/lib/prisma.js";
import { Order } from "@prisma/client";

interface ListRestaurantOrdersRequest {
  restaurantId: string;
  userId: string;
}

interface ListRestaurantOrdersResponse {
  orders: Order[];
}

export class ListRestaurantOrdersUseCase {
  async execute({
    restaurantId,
    userId,
  }: ListRestaurantOrdersRequest): Promise<ListRestaurantOrdersResponse> {
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

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurantId,
      },

      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { orders };
  }
}
