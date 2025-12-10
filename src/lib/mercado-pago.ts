import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

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

export async function generatePixPayment({
  transactionAmount,
  description,
  payerEmail,
  payerFirstName,
  restaurantAccessToken,
  orderId,
  restaurantId,
}: GeneratePixParams) {
  const client = new MercadoPagoConfig({
    accessToken: restaurantAccessToken,
  });

  const payment = new Payment(client);

  const apiUrl = process.env.API_URL || "http://localhost:3333";

  const notificationUrl = apiUrl.includes("localhost")
    ? undefined
    : `${apiUrl}/webhooks/mercadopago?restaurantId=${restaurantId}`;

  const body = {
    transaction_amount: transactionAmount,
    description: description,
    payment_method_id: "pix",
    payer: {
      email: payerEmail,
      first_name: payerFirstName,
    },
    notification_url: notificationUrl,
    metadata: {
      order_id: orderId,
    },
  };

  const response = await payment.create({ body });

  return {
    id: response.id?.toString(),
    status: response.status,
    qrCode: response.point_of_interaction?.transaction_data?.qr_code,
    qrCodeBase64:
      response.point_of_interaction?.transaction_data?.qr_code_base64,
    ticketUrl: response.point_of_interaction?.transaction_data?.ticket_url,
  };
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

export async function createCheckoutPreference({
  items,
  payerEmail,
  restaurantAccessToken,
  orderId,
  restaurantId,
  deliveryFee,
}: CreatePreferenceParams) {
  const client = new MercadoPagoConfig({
    accessToken: restaurantAccessToken,
  });

  const preference = new Preference(client);

  const preferenceItems = [...items];
  if (deliveryFee > 0) {
    preferenceItems.push({
      id: "delivery-fee",
      title: "Taxa de Entrega",
      quantity: 1,
      unit_price: deliveryFee,
    });
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const apiUrl = process.env.API_URL || "http://localhost:3333";

  // URLs de retorno
  const backUrlSuccess = `${frontendUrl}/orders/${orderId}`;
  const backUrlFailure = `${frontendUrl}/orders/${orderId}`;
  const backUrlPending = `${frontendUrl}/orders/${orderId}`;

  // Proteção 1: Webhook (Notification URL)
  const notificationUrl = apiUrl.includes("localhost")
    ? undefined
    : `${apiUrl}/webhooks/mercadopago?restaurantId=${restaurantId}`;

  // Proteção 2: Auto Return (Retorno Automático)
  // Só ativa se estiver em HTTPS (Produção). Em HTTP (Localhost), deve ser undefined.
  const isProduction = frontendUrl.startsWith("https");
  const autoReturn = isProduction ? "approved" : undefined;

  const preferenceBody = {
    items: preferenceItems,
    payer: {
      email: payerEmail,
    },
    back_urls: {
      success: backUrlSuccess,
      failure: backUrlFailure,
      pending: backUrlPending,
    },
    auto_return: autoReturn, // undefined em localhost
    external_reference: orderId,
    statement_descriptor: "OXYFOOD",
    notification_url: notificationUrl,
  };

  console.log("=== DEBUG CHECKOUT PAYLOAD ===");
  console.log(
    `Frontend Seguro (HTTPS)? ${isProduction ? "SIM" : "NÃO (Localhost)"}`
  );
  console.log(`Auto Return Ativo? ${autoReturn || "NÃO (Undefined)"}`);
  console.log(JSON.stringify(preferenceBody, null, 2));
  console.log("==============================");

  try {
    const response = await preference.create({
      body: preferenceBody,
    });
    return response.init_point;
  } catch (error: any) {
    console.error("Erro fatal MP:", JSON.stringify(error, null, 2));
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
  const client = new MercadoPagoConfig({
    accessToken: restaurantAccessToken,
  });

  const payment = new Payment(client);

  try {
    const response = await payment.get({ id: paymentId });
    return response;
  } catch (error) {
    console.error("Erro ao buscar pagamento no Mercado Pago:", error);
    return null;
  }
}
