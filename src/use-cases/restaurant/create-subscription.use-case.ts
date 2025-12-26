import { prisma } from "@/lib/prisma.js";
import { asaasService } from "@/lib/asaas.js";

interface CreateSubscriptionRequest {
  restaurantId: string;
  userId: string;
}

export class CreateSubscriptionUseCase {
  async execute({ restaurantId, userId }: CreateSubscriptionRequest) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!user || !restaurant) {
      throw new Error("Usuário ou Restaurante não encontrado.");
    }

    if (restaurant.userId !== user.id) {
      throw new Error("Este restaurante não pertence a você.");
    }

    let asaasCustomerId = user.asaasCustomerId;

    if (!asaasCustomerId) {
      const docNumber = user.cpf || restaurant.cpfCnpj;

      if (!docNumber) {
        throw new Error(
          "É necessário ter um CPF ou CNPJ cadastrado para gerar a cobrança."
        );
      }

      asaasCustomerId = await asaasService.createCustomer({
        name: user.name,
        email: user.email,
        cpfCnpj: docNumber,
        phone: restaurant.phoneNumber,
        externalId: user.id,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId },
      });
    }

    if (!asaasCustomerId) {
      throw new Error("Erro ao gerar ID do cliente no Asaas.");
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
