import axios from "axios";

const asaasApi = axios.create({
  baseURL: process.env.ASAAS_API_URL,
  headers: {
    access_token: process.env.ASAAS_API_KEY,
    "Content-Type": "application/json",
  },
});

interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export const asaasService = {
  async createCustomer(data: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
    externalId: string;
  }) {
    try {
      const search = await asaasApi.get("/customers", {
        params: { cpfCnpj: data.cpfCnpj },
      });

      if (search.data.data && search.data.data.length > 0) {
        return search.data.data[0].id;
      }

      const response = await asaasApi.post("/customers", {
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj,
        mobilePhone: data.phone,
        externalReference: data.externalId,
      });

      return response.data.id;
    } catch (error: any) {
      console.error(
        "Erro Asaas createCustomer:",
        error.response?.data || error.message,
      );
      throw new Error("Falha ao criar cliente no Asaas");
    }
  },

  async createSubscription(
    customerId: string,
    value: number,
    restaurantId: string,
    cycle: "MONTHLY" | "YEARLY",
    billingType: "PIX" | "CREDIT_CARD" | "UNDEFINED",
    creditCard?: CreditCardData,
  ) {
    try {
      const payload: any = {
        customer: customerId,
        billingType: billingType,
        value: value,
        nextDueDate: new Date().toISOString().split("T")[0],
        cycle: cycle,
        description: `Assinatura OxyFood ${cycle === "MONTHLY" ? "Mensal" : "Anual"}`,
        externalReference: restaurantId,
      };

      if (billingType === "CREDIT_CARD" && creditCard) {
        payload.creditCard = creditCard;
        payload.creditCardHolderInfo = {
          name: creditCard.holderName,
          email: "email@do-titular.com",
          cpfCnpj: "00000000000",
          postalCode: "00000000",
          addressNumber: "0",
          phone: "00000000000",
        };
      }

      const response = await asaasApi.post("/subscriptions", payload);
      return response.data;
    } catch (error: any) {
      console.error(
        "Erro Asaas createSubscription:",
        error.response?.data || error.message,
      );
      throw new Error(
        error.response?.data?.errors?.[0]?.description ||
          "Falha ao criar assinatura no Asaas",
      );
    }
  },

  async getSubscriptionPayments(subscriptionId: string) {
    try {
      const response = await asaasApi.get(
        `/subscriptions/${subscriptionId}/payments`,
      );
      return response.data.data;
    } catch (error: any) {
      console.error(
        "Erro Asaas getPayments:",
        error.response?.data || error.message,
      );
      return [];
    }
  },

  async getSubscription(subscriptionId: string) {
    try {
      const response = await asaasApi.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Erro Asaas getSubscription:",
        error.response?.data || error.message,
      );
      throw new Error("Falha ao buscar assinatura");
    }
  },
};
