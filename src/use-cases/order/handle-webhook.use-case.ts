import { prisma } from "@/lib/prisma.js";
import { getPayment } from "@/lib/mercado-pago.js";
import { io } from "@/lib/socket.js";

interface HandleWebhookRequest {
  topic: string;
  id: string;
  restaurantId: string;
}

export class HandleWebhookUseCase {
  async execute({ topic, id, restaurantId }: HandleWebhookRequest) {
    if (topic !== "payment" && topic !== "payment.created") {
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || !restaurant.mercadoPagoAccessToken) {
      throw new Error("Restaurante não encontrado ou sem token.");
    }

    const payment = await getPayment({
      paymentId: id,
      restaurantAccessToken: restaurant.mercadoPagoAccessToken,
    });

    if (!payment) {
      throw new Error("Pagamento não encontrado.");
    }

    if (payment.status === "approved") {
      const orderId = payment.external_reference || payment.metadata?.order_id;

      if (!orderId) return;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order && order.status === "PENDING") {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PREPARING",
            paymentStatus: "APPROVED",
            mercadoPagoId: payment.id?.toString(),
          },
        });

        if (io) {
          io.to(restaurantId).emit("new-order", updatedOrder);
        }
      }
    }
  }
}
