import { prisma } from "@/lib/prisma.js";
import { asaasService } from "@/lib/asaas.js";

interface CreateSubscriptionRequest {
  restaurantId: string;
  userId: string;
  plan: "START" | "PRO" | "ENTERPRISE";
}

export class CreateSubscriptionUseCase {
  async execute({ restaurantId, userId, plan }: CreateSubscriptionRequest) {
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

    if (
      restaurant.subscriptionStatus === "ACTIVE" &&
      restaurant.plan === plan
    ) {
      throw new Error(
        "Você já possui este plano ativo. Não é necessário pagar novamente.",
      );
    }

    let price = 0;
    switch (plan) {
      case "START":
        price = 59.9;
        break;
      case "PRO":
        price = 119.9;
        break;
      case "ENTERPRISE":
        price = 299.9;
        break;
      default:
        throw new Error("Plano inválido.");
    }

    let asaasCustomerId = user.asaasCustomerId;

    if (!asaasCustomerId) {
      const docNumber = user.cpf || restaurant.cpfCnpj;

      if (!docNumber) {
        throw new Error(
          "É necessário ter um CPF ou CNPJ cadastrado nas configurações.",
        );
      }

      asaasCustomerId = await asaasService.createCustomer({
        name: user.name,
        email: user.email,
        cpfCnpj: docNumber,
        phone: restaurant.phoneNumber || "",
        externalId: user.id,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId },
      });
    }

    if (!asaasCustomerId) {
      throw new Error("Falha ao identificar cliente no Asaas.");
    }

    const subscription = await asaasService.createSubscription(
      asaasCustomerId,
      price,
      restaurant.id,
    );

    const payments = await asaasService.getSubscriptionPayments(
      subscription.id,
    );
    const firstPayment = payments && payments.length > 0 ? payments[0] : null;

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        plan: plan,
        subscriptionStatus: "PENDING",
      },
    });

    return {
      subscriptionId: subscription.id,
      status: "PENDING",
      paymentLink:
        firstPayment?.invoiceUrl || firstPayment?.bankSlipUrl || null,
    };
  }
}
