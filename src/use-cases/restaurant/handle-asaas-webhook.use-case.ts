import { prisma } from "@/lib/prisma.js";
import { asaasService } from "@/lib/asaas.js";

interface HandleAsaasWebhookRequest {
  event: string;
  payment: {
    id: string;
    customer: string;
    subscription?: string;
    installment?: string;
    externalReference?: string;
    status: string;
    billingType: string;
    value: number;
    netValue: number;
    description?: string;
    creditDate?: string;
    confirmedDate?: string;
  };
}

export class HandleAsaasWebhookUseCase {
  async execute({ event, payment }: HandleAsaasWebhookRequest) {
    console.log(
      `[Webhook] Processando evento: ${event} para pagamento ${payment.id}`,
    );

    if (!payment.subscription) {
      console.log("[Webhook] Ignorando evento não relacionado a assinatura.");
      return;
    }

    const subscriptionId = payment.subscription;

    let subscriptionDetails;
    try {
      subscriptionDetails = await asaasService.getSubscription(subscriptionId);
    } catch (error) {
      console.error(
        `[Webhook] Erro ao buscar assinatura ${subscriptionId}:`,
        error,
      );
      return;
    }

    const restaurantId = subscriptionDetails.externalReference;

    if (!restaurantId) {
      console.error(
        "[Webhook] Assinatura sem externalReference (ID do restaurante).",
      );
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      console.error(`[Webhook] Restaurante ${restaurantId} não encontrado.`);
      return;
    }

    if (
      event === "PAYMENT_CONFIRMED" ||
      event === "PAYMENT_RECEIVED" ||
      event === "PAYMENT_CREDITED"
    ) {
      const now = new Date();

      let baseDate =
        restaurant.planExpiresAt && restaurant.planExpiresAt > now
          ? new Date(restaurant.planExpiresAt)
          : now;

      const isYearly = restaurant.billingCycle === "YEARLY";

      if (isYearly) {
        baseDate.setFullYear(baseDate.getFullYear() + 1);
      } else {
        baseDate.setMonth(baseDate.getMonth() + 1);
      }

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          subscriptionStatus: "ACTIVE",
          planExpiresAt: baseDate,
        },
      });

      console.log(
        `[Webhook] Assinatura renovada (${isYearly ? "ANUAL" : "MENSAL"}) para restaurante ${restaurant.name}. Nova expiração: ${baseDate.toISOString()}`,
      );
    } else if (event === "PAYMENT_OVERDUE") {
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          subscriptionStatus: "OVERDUE",
        },
      });
      console.log(
        `[Webhook] Assinatura vencida para restaurante ${restaurant.name}`,
      );
    }
  }
}
