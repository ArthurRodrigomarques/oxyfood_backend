import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ADMIN_ACCESS_TOKEN!,
});

const planClient = new PreApprovalPlan(client);
const subscriptionClient = new PreApproval(client);

export const mpAdminService = {
  async createPlan(name: string, price: number) {
    const response = await planClient.create({
      body: {
        reason: name,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: price,
          currency_id: "BRL",
        },
        back_url: "https://oxyfood.com.br/admin/settings",
        status: "active",
      },
    });
    return response.id;
  },

  // 2. Criar a Assinatura para um Restaurante
  async createSubscription(planId: string, userEmail: string) {
    const response = await subscriptionClient.create({
      body: {
        preapproval_plan_id: planId,
        payer_email: userEmail,
        status: "pending",
        back_url: "https://oxyfood.com.br/admin/status",
      },
    });

    return {
      id: response.id,
      paymentLink: response.init_point,
      status: response.status,
    };
  },

  // 3. Checar se ele pagou (Status)
  async getSubscriptionStatus(subscriptionId: string) {
    const response = await subscriptionClient.get({ id: subscriptionId });
    return response.status; // 'authorized', 'paused', 'cancelled'
  },
};
