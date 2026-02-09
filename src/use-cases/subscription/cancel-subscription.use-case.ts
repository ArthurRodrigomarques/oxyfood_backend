import { prisma } from "@/lib/prisma.js";
import { asaasService } from "@/lib/asaas.js";

interface CancelSubscriptionRequest {
  userId: string;
}

export class CancelSubscriptionUseCase {
  async execute({ userId }: CancelSubscriptionRequest) {
    const restaurant = await prisma.restaurant.findFirst({
      where: { userId },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    const subscriptionId = restaurant.asaasSubscriptionId;

    if (!subscriptionId) {
      throw new Error("Nenhuma assinatura ativa encontrada para cancelar.");
    }

    try {
      await asaasService.cancelSubscription(subscriptionId);
    } catch (error) {
      console.error("Erro ao cancelar no Asaas:", error);
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        subscriptionStatus: "CANCELED",
        asaasSubscriptionId: null,
      },
    });

    return updatedRestaurant;
  }
}
