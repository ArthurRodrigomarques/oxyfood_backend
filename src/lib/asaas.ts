import axios from "axios";

const asaasApi = axios.create({
  baseURL: process.env.ASAAS_API_URL,
  headers: {
    access_token: process.env.ASAAS_API_KEY,
  },
});

export const asaasService = {
  // 1. Criar o Cliente (Restaurante) no Asaas
  async createCustomer(restaurant: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
  }) {
    const { data } = await asaasApi.post("/customers", {
      name: restaurant.name,
      email: restaurant.email,
      cpfCnpj: restaurant.cpfCnpj,
      mobilePhone: restaurant.phone,
    });
    return data.id;
  },

  // 2. Criar a Assinatura
  async createSubscription(customerId: string, value: number) {
    const { data } = await asaasApi.post("/subscriptions", {
      customer: customerId,
      billingType: "PIX",
      value: value,
      nextDueDate: new Date().toISOString().split("T")[0],
      cycle: "MONTHLY",
      description: "Assinatura OxyFood Pro",
    });
    return data;
  },
};
