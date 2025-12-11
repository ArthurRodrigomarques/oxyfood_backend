import { prisma } from "@/lib/prisma.js";
import { Order } from "@prisma/client";
import { z } from "zod";
import { createOrderBodySchema } from "@/schemas/order.schema.js";
import { Decimal } from "@prisma/client/runtime/library";
import { getIO } from "@/lib/socket.js";
import {
  generatePixPayment,
  createCheckoutPreference,
} from "@/lib/mercado-pago.js";

type CreateOrderRequest = z.infer<typeof createOrderBodySchema> & {
  restaurantId: string;
};

export class CreateOrderUseCase {
  async execute({
    restaurantId,
    customerName,
    customerPhone,
    customerAddress,
    paymentMethod,
    trocoPara,
    items,
  }: CreateOrderRequest): Promise<Order> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    const tokenToUse =
      restaurant.mercadoPagoAccessToken || process.env.MP_ACCESS_TOKEN;

    if (!restaurant.isOpen) {
      throw new Error("Este restaurante está fechado no momento.");
    }

    const isOnlinePayment =
      paymentMethod === "Pix" || paymentMethod === "CartaoOnline";

    if (isOnlinePayment && !tokenToUse) {
      throw new Error("Pagamento online indisponível: Token não configurado.");
    }

    let subTotalPrice = new Decimal(0);
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Produto com ID ${item.productId} não encontrado.`);
      }

      if (!product.available) {
        throw new Error(`O produto "${product.name}" não está disponível.`);
      }

      const selectedOptions = await prisma.option.findMany({
        where: {
          id: { in: item.options || [] },
        },
      });

      const optionsPrice = selectedOptions.reduce((total, option) => {
        return total.add(option.priceDelta);
      }, new Decimal(0));

      const unitPrice = product.basePrice.add(optionsPrice);

      subTotalPrice = subTotalPrice.add(unitPrice.mul(item.quantity));

      let optionsText = selectedOptions.map((opt) => opt.name).join(", ");
      if (item.observation) {
        optionsText += optionsText
          ? ` | ${item.observation}`
          : item.observation;
      }

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        optionsDescription: optionsText,
        title: product.name || "Item do Cardápio",
      });
    }

    const deliveryFee = restaurant.deliveryFee;
    const totalPrice = subTotalPrice.add(deliveryFee);

    const paymentMethodLabel =
      paymentMethod === "CartaoOnline" ? "Cartão (Online)" : paymentMethod;

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        paymentMethod: paymentMethodLabel,
        trocoPara,
        subTotalPrice,
        deliveryFee,
        totalPrice,
        restaurantId: restaurantId,
        paymentStatus: "PENDING",
        status: "PENDING",
        orderItems: {
          create: orderItemsData.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            optionsDescription: item.optionsDescription,
            productId: item.productId,
          })),
        },
      },
      include: {
        orderItems: { include: { product: true } },
      },
    });

    if (isOnlinePayment && tokenToUse) {
      const safeEmail = "cliente@oxyfood.com";
      const safeFirstName = customerName.split(" ")[0] || "Cliente";

      if (paymentMethod === "Pix") {
        try {
          const paymentData = await generatePixPayment({
            transactionAmount: Number(totalPrice),
            description: `Pedido #${order.id.slice(0, 4)}`,
            payerEmail: safeEmail,
            payerFirstName: safeFirstName,
            restaurantAccessToken: tokenToUse,
            orderId: order.id,
            restaurantId: restaurant.id,
          });

          await prisma.order.update({
            where: { id: order.id },
            data: {
              mercadoPagoId: paymentData.id,
              paymentLink: paymentData.qrCode || null,
            },
          });

          Object.assign(order, {
            qrCodeBase64: paymentData.qrCodeBase64,
            paymentLink: paymentData.qrCode,
          });
        } catch (error) {
          await prisma.order.delete({ where: { id: order.id } });
          throw new Error("Erro ao gerar Pix. Tente novamente.");
        }
      }

      if (paymentMethod === "CartaoOnline") {
        try {
          const checkoutUrl = await createCheckoutPreference({
            items: orderItemsData.map((item) => ({
              id: item.productId,
              title: item.title,
              quantity: item.quantity,
              unit_price: Number(item.unitPrice),
            })),
            deliveryFee: Number(deliveryFee),
            payerEmail: safeEmail,
            restaurantAccessToken: tokenToUse,
            orderId: order.id,
            restaurantId: restaurant.id,
          });

          await prisma.order.update({
            where: { id: order.id },
            data: { paymentLink: checkoutUrl || null },
          });

          order.paymentLink = checkoutUrl;
        } catch (error) {
          console.error(error);
          await prisma.order.delete({ where: { id: order.id } });
          throw new Error("Erro ao gerar Checkout. Tente novamente.");
        }
      }
    }

    if (!isOnlinePayment) {
      try {
        const io = getIO();
        io.to(restaurantId).emit("new-order", order);
      } catch (e) {
        // Ignora erro de socket
      }
    }

    return order;
  }
}
