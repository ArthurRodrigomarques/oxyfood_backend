import { prisma } from "@/lib/prisma.js";
import { getIO } from "@/lib/socket.js";

interface CancelOrderRequest {
  orderId: string;
  userId: string;
}

export class CancelOrderUseCase {
  async execute({ orderId, userId }: CancelOrderRequest) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      throw new Error("Pedido não encontrado.");
    }

    if (order.status !== "PENDING") {
      throw new Error("O pedido já está em preparo e não pode ser cancelado.");
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REJECTED",
        paymentStatus:
          order.paymentMethod === "Pix" ||
          order.paymentMethod === "CartaoOnline"
            ? "REFUNDED"
            : order.paymentStatus,
      },
    });

    const io = getIO();
    io.to(order.restaurantId).emit("order-canceled", {
      orderId: order.id,
      reason: "Cancelado pelo cliente",
    });

    io.to(`order:${order.id}`).emit("order-status-updated", {
      orderId: order.id,
      status: "REJECTED",
    });

    return updatedOrder;
  }
}
