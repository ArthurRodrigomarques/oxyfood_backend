import { MercadoPagoConfig, Payment } from "mercadopago";

interface GeneratePixParams {
  transactionAmount: number;
  description: string;
  payerEmail: string;
  payerFirstName: string;
  restaurantAccessToken: string;
  orderId: string;
}

export async function generatePixPayment({
  transactionAmount,
  description,
  payerEmail,
  payerFirstName,
  restaurantAccessToken,
  orderId,
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
    notification_url: `${process.env.API_URL}/webhooks/mercadopago`,
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
