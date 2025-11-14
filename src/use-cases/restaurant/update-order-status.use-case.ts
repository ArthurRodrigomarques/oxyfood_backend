import { prisma } from "@/lib/prisma.js";
import { Order, OrderStatus } from "@prisma/client";

interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  userId: string;
}

export class UpdateOrderStatusUseCase {
  async execute({
    orderId,
    status,
    userId,
  }: UpdateOrderStatusRequest): Promise<Order> {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        restaurant: true,
      },
    });

    if (!order) {
      throw new Error("Pedido não encontrado.");
    }

    if (order.restaurant.userId !== userId) {
      throw new Error("Não autorizado.");
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
      },
    });

    return updatedOrder;
  }
}
