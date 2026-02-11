import { prisma } from "@/lib/prisma.js";
import { getPayment } from "@/lib/mercado-pago.js";
import { getIO } from "@/lib/socket.js";

interface HandleWebhookRequest {
  topic: string;
  id: string;
  restaurantId: string;
}

export class HandleWebhookUseCase {
  async execute({ topic, id, restaurantId }: HandleWebhookRequest) {
    if (topic !== "payment" || !id) {
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || !restaurant.mercadoPagoAccessToken) {
      return;
    }

    let payment;
    try {
      payment = await getPayment({
        paymentId: id,
        restaurantAccessToken: restaurant.mercadoPagoAccessToken,
      });
    } catch (error) {
      return;
    }

    if (!payment || !payment.id) {
      return;
    }

    if (payment.status === "approved") {
      const orderId = payment.external_reference || payment.metadata?.order_id;

      if (!orderId) return;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order && order.paymentStatus !== "APPROVED") {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PREPARING",
            paymentStatus: "APPROVED",
            mercadoPagoId: payment.id.toString(),
          },
        });

        try {
          const io = getIO();
          io.to(restaurantId).emit("new-order", updatedOrder);
        } catch (error) {}
      }
    }
  }
}
