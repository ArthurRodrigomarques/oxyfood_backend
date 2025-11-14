import { prisma } from "@/lib/prisma.js";
import { OrderStatus } from "@prisma/client";

interface GetOrderStatusRequest {
  orderId: string;
}

interface GetOrderStatusResponse {
  status: OrderStatus;
  customerName: string;
}

export class GetOrderStatusUseCase {
  async execute({
    orderId,
  }: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new Error("Pedido não encontrado.");
    }

    return {
      status: order.status,
      customerName: order.customerName,
    };
  }
}
