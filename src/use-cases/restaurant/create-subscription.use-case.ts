import { prisma } from "@/lib/prisma.js";
import { asaasService } from "@/lib/asaas.js";

interface CreateSubscriptionRequest {
  restaurantId: string;
  userId: string;
  plan: "START" | "PRO" | "ENTERPRISE";
  billingCycle: "MONTHLY" | "YEARLY";
  billingType?: "PIX" | "CREDIT_CARD" | "UNDEFINED";
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
}

export class CreateSubscriptionUseCase {
  async execute({
    restaurantId,
    userId,
    plan,
    billingCycle,
    billingType = "PIX",
    creditCard,
  }: CreateSubscriptionRequest) {
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

    const prices = {
      START: { MONTHLY: 59.9, YEARLY: 599.0 },
      PRO: { MONTHLY: 119.9, YEARLY: 1199.0 },
      ENTERPRISE: { MONTHLY: 299.9, YEARLY: 2999.0 },
    };

    const price = prices[plan][billingCycle];

    let asaasCustomerId = user.asaasCustomerId;

    if (!asaasCustomerId) {
      const docNumber = user.cpf || restaurant.cpfCnpj;

      if (!docNumber) {
        throw new Error(
          "É necessário ter um CPF ou CNPJ cadastrado para assinar.",
        );
      }

      const cleanDoc = docNumber.replace(/\D/g, "");

      asaasCustomerId = await asaasService.createCustomer({
        name: user.name,
        email: user.email,
        cpfCnpj: cleanDoc,
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
      asaasCustomerId!,
      price,
      restaurant.id,
      billingCycle,
      billingType,
      creditCard,
    );

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        plan: plan,
        billingCycle: billingCycle,
        subscriptionStatus: "PENDING",
        asaasSubscriptionId: subscription.id,
      },
    });

    let payments: any[] = [];
    let attempts = 0;

    while (payments.length === 0 && attempts < 5) {
      if (attempts > 0) await new Promise((r) => setTimeout(r, 1000));
      payments = await asaasService.getSubscriptionPayments(subscription.id);
      attempts++;
    }

    const firstPayment = payments && payments.length > 0 ? payments[0] : null;

    return {
      subscriptionId: subscription.id,
      status: "PENDING",
      paymentLink:
        firstPayment?.invoiceUrl || firstPayment?.bankSlipUrl || null,
    };
  }
}
