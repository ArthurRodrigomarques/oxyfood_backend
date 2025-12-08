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

  const body = {
    transaction_amount: transactionAmount,
    description: description,
    payment_method_id: "pix",
    payer: {
      email: payerEmail,
      first_name: payerFirstName,
    },
    notification_url: `${process.env.API_URL}/webhooks/mercadopago?restaurantId=${restaurantId}`,
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

  const response = await preference.create({
    body: {
      items: preferenceItems,
      payer: {
        email: payerEmail,
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/orders/${orderId}`,
        failure: `${process.env.FRONTEND_URL}/orders/${orderId}`,
        pending: `${process.env.FRONTEND_URL}/orders/${orderId}`,
      },
      auto_return: "approved",
      notification_url: `${process.env.API_URL}/webhooks/mercadopago?restaurantId=${restaurantId}`,
      external_reference: orderId,
      statement_descriptor: "OXYFOOD",
    },
  });

  return response.init_point;
}
