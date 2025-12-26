import { prisma } from "@/lib/prisma.js";
import { asaasService } from "@/lib/asaas.js";

interface CreateSubscriptionRequest {
  restaurantId: string;
}

export class CreateSubscriptionUseCase {
  async execute({ restaurantId }: CreateSubscriptionRequest) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { user: true },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    if (!restaurant.cpfCnpj) {
      throw new Error("Restaurante precisa de CPF/CNPJ para assinar.");
    }

    const asaasCustomerId = await asaasService.createCustomer({
      name: restaurant.name,
      email: restaurant.user.email,
      cpfCnpj: restaurant.cpfCnpj,
      phone: restaurant.phoneNumber,
      externalId: restaurant.id,
    });

    if (restaurant.asaasCustomerId !== asaasCustomerId) {
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { asaasCustomerId },
      });
    }

    const subscription = await asaasService.createSubscription(
      asaasCustomerId,
      99.9,
      restaurant.id
    );

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      paymentLink: subscription.invoiceUrl,
    };
  }
}
