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

    console.log(
      `[Webhook] Processando evento: ${event} | Ref: ${payment.externalReference}`
    );

    const relevantEvents = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];
    const disableEvents = ["PAYMENT_OVERDUE", "SUBSCRIPTION_DELETED"];

    if (!relevantEvents.includes(event) && !disableEvents.includes(event)) {
      return;
    }

    let restaurant = null;

    if (payment.externalReference) {
      restaurant = await prisma.restaurant.findUnique({
        where: { id: payment.externalReference },
      });
    }

    if (!restaurant && payment.customer) {
      console.log(
        "[Webhook] Buscando restaurante através do Dono (asaasCustomerId)..."
      );

      const user = await prisma.user.findFirst({
        where: { asaasCustomerId: payment.customer },
        include: { restaurants: true },
      });

      if (user && user.restaurants.length > 0) {
        restaurant = user.restaurants[0];
      }
    }

    if (!restaurant) {
      console.error(
        `❌ [Asaas] Restaurante não encontrado para o customer ${payment.customer} ou ref ${payment.externalReference}`
      );
      return;
    }

    if (relevantEvents.includes(event)) {
      console.log(`✅ [Asaas] Pagamento OK. Ativando loja: ${restaurant.name}`);

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { subscriptionStatus: "ACTIVE" },
      });
    } else if (disableEvents.includes(event)) {
      console.log(
        `⛔ [Asaas] Pagamento pendente/falhou. Bloqueando loja: ${restaurant.name}`
      );

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { subscriptionStatus: "INACTIVE" },
      });
    }
  }
}
