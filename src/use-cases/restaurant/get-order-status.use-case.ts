import { prisma } from "@/lib/prisma.js";

interface GetOrderStatusRequest {
  orderId: string;
}

export class GetOrderStatusUseCase {
  async execute({ orderId }: GetOrderStatusRequest) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        restaurant: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Pedido não encontrado.");
    }

    return order;
  }
}
