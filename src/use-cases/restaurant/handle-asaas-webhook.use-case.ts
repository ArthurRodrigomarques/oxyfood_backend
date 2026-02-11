import { prisma } from "@/lib/prisma.js";
import { asaasService } from "@/lib/asaas.js";

interface HandleAsaasWebhookRequest {
  event: string;
  payment: {
    id: string;
    customer: string;
    subscription?: string;
    status: string;
    billingType: string;
    value: number;
    netValue: number;
    description?: string;
    externalReference?: string;
  };
}

export class HandleAsaasWebhookUseCase {
  async execute({ event, payment }: HandleAsaasWebhookRequest) {
    if (!payment.subscription) {
      return;
    }

    let subscriptionDetails;

    try {
      subscriptionDetails = await asaasService.getSubscription(
        payment.subscription,
      );
    } catch (error) {
      console.error(error);
      return;
    }

    if (!subscriptionDetails || !subscriptionDetails.externalReference) {
      return;
    }

    const restaurantId = subscriptionDetails.externalReference;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return;
    }

    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      const now = new Date();
      let baseDate = now;

      if (restaurant.planExpiresAt && restaurant.planExpiresAt > now) {
        baseDate = new Date(restaurant.planExpiresAt);
      }

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
          isOpen: true,
        },
      });
    } else if (event === "PAYMENT_OVERDUE") {
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          subscriptionStatus: "OVERDUE",
          isOpen: false,
        },
      });
    }
  }
}
