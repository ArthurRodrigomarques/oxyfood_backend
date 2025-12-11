import { prisma } from "@/lib/prisma.js";

interface GetOrderDetailsRequest {
  orderId: string;
}

export class GetOrderDetailsUseCase {
  async execute({ orderId }: GetOrderDetailsRequest) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          select: {
            name: true,
            slug: true,
            phoneNumber: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
                basePrice: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error("Pedido não encontrado.");
    }

    return { order };
  }
}
