import { prisma } from "@/lib/prisma.js";

interface AsaasWebhookEvent {
  event: string;
  payment: {
    id: string;
    customer: string;
    subscription?: string;
    status: string;
    externalReference?: string;
  };
}

export class HandleAsaasWebhookUseCase {
  async execute(eventData: AsaasWebhookEvent) {
    const { event, payment } = eventData;

    const relevantEvents = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];
    const disableEvents = ["PAYMENT_OVERDUE", "SUBSCRIPTION_DELETED"];

    let restaurant = null;

    if (payment.externalReference) {
      restaurant = await prisma.restaurant.findUnique({
        where: { id: payment.externalReference },
      });
    }

    if (!restaurant) {
      restaurant = await prisma.restaurant.findFirst({
        where: { asaasCustomerId: payment.customer },
      });
    }

    if (!restaurant) {
      console.log(
        `[Asaas] Restaurante não encontrado para pagamento ${payment.id}`
      );
      return;
    }

    if (relevantEvents.includes(event)) {
      console.log(
        `[Asaas] Pagamento confirmado. Ativando restaurante: ${restaurant.name}`
      );

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { subscriptionStatus: "ACTIVE" },
      });
    } else if (disableEvents.includes(event)) {
      console.log(
        `[Asaas] Pagamento falhou. Desativando restaurante: ${restaurant.name}`
      );

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { subscriptionStatus: "INACTIVE" },
      });
    }
  }
}
