import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const getClient = (token: string) =>
  new MercadoPagoConfig({ accessToken: token });

interface CommonParams {
  restaurantAccessToken: string;
  orderId: string;
  restaurantId?: string;
}

interface GeneratePixParams extends CommonParams {
  transactionAmount: number;
  description: string;
  payerEmail: string;
  payerFirstName: string;
}

interface CreatePreferenceParams extends CommonParams {
  items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }[];
  payerEmail: string;
  deliveryFee: number;
}

export async function generatePixPayment({
  transactionAmount,
  description,
  payerEmail,
  payerFirstName,
  restaurantAccessToken,
  orderId,
  restaurantId,
}: GeneratePixParams) {
  const payment = new Payment(getClient(restaurantAccessToken));

  const apiUrl = process.env.API_URL || "http://localhost:3333";
  const notificationUrl = apiUrl.includes("localhost")
    ? undefined
    : `${apiUrl}/webhooks/mercadopago?restaurantId=${restaurantId}`;

  const safeDescription = description?.trim() || `Pedido ${orderId}`;
  const uniqueEmail = payerEmail || `cliente_${Date.now()}@oxyfood.test`;

  try {
    const response = await payment.create({
      body: {
        transaction_amount: Number(transactionAmount.toFixed(2)),
        description: safeDescription.substring(0, 100),
        payment_method_id: "pix",
        payer: {
          email: uniqueEmail,
          first_name: payerFirstName || "Cliente",
        },
        notification_url: notificationUrl,
        metadata: {
          order_id: orderId,
        },
      },
    });

    return {
      id: response.id?.toString(),
      status: response.status,
      qrCode: response.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64:
        response.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: response.point_of_interaction?.transaction_data?.ticket_url,
    };
  } catch (error) {
    console.error("Erro MP Pix:", error);
    throw error;
  }
}

export async function createCheckoutPreference({
  items,
  payerEmail,
  restaurantAccessToken,
  orderId,
  restaurantId,
  deliveryFee,
}: CreatePreferenceParams) {
  const preference = new Preference(getClient(restaurantAccessToken));

  const preferenceItems = items.map((item) => ({
    id: item.id || "item-generico",
    title: item.title && item.title.trim() ? item.title : "Produto",
    quantity: Number(item.quantity),
    currency_id: "BRL",
    unit_price: Number(Number(item.unit_price).toFixed(2)),
  }));

  if (deliveryFee > 0) {
    preferenceItems.push({
      id: "delivery-fee",
      title: "Taxa de Entrega",
      quantity: 1,
      currency_id: "BRL",
      unit_price: Number(Number(deliveryFee).toFixed(2)),
    });
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const apiUrl = process.env.API_URL || "http://localhost:3333";

  const backUrl = `${frontendUrl}/orders/${orderId}`;

  const notificationUrl = apiUrl.includes("localhost")
    ? undefined
    : `${apiUrl}/webhooks/mercadopago?restaurantId=${restaurantId}`;

  const uniqueEmail = `test_user_${Date.now()}_${Math.floor(
    Math.random() * 999
  )}@testuser.com`;

  try {
    const response = await preference.create({
      body: {
        items: preferenceItems,
        payer: {
          email: uniqueEmail,
        },
        back_urls: {
          success: backUrl,
          failure: backUrl,
          pending: backUrl,
        },
        external_reference: orderId,
        statement_descriptor: "OXYFOOD",
        notification_url: notificationUrl,
        binary_mode: false,
      },
    });

    if (!response.init_point) {
      throw new Error("Link não gerado pelo Mercado Pago.");
    }

    return response.init_point;
  } catch (error) {
    console.error("Erro MP Preference:", error);
    throw error;
  }
}

export async function getPayment({
  paymentId,
  restaurantAccessToken,
}: {
  paymentId: string;
  restaurantAccessToken: string;
}) {
  const payment = new Payment(getClient(restaurantAccessToken));
  try {
    return await payment.get({ id: paymentId });
  } catch (error) {
    return null;
  }
}
