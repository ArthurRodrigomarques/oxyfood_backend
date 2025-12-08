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

    if (!restaurant.isOpen) {
      throw new Error("Este restaurante está fechado no momento.");
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
        throw new Error(
          `O produto "${product.name}" esgotou ou não está disponível.`
        );
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

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        optionsDescription: selectedOptions.map((opt) => opt.name).join(", "),
        title: product.name,
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
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (restaurant.mercadoPagoAccessToken) {
      console.log(
        "✅ Token do Mercado Pago encontrado:",
        restaurant.mercadoPagoAccessToken
      );

      if (paymentMethod === "Pix") {
        try {
          const paymentData = await generatePixPayment({
            transactionAmount: Number(totalPrice),
            description: `Pedido #${order.id.slice(0, 4).toUpperCase()} - ${
              restaurant.name
            }`,
            payerEmail: "cliente@oxyfood.com",
            payerFirstName: customerName.split(" ")[0],
            restaurantAccessToken: restaurant.mercadoPagoAccessToken,
            orderId: order.id,
            restaurantId: restaurant.id,
          });

          await prisma.order.update({
            where: { id: order.id },
            data: {
              mercadoPagoId: paymentData.id,
              paymentLink: paymentData.qrCode,
            },
          });

          Object.assign(order, {
            qrCodeBase64: paymentData.qrCodeBase64,
            copyPaste: paymentData.qrCode,
          });
        } catch (error) {
          console.error("Erro ao gerar Pix no Mercado Pago:", error);
        }
      }

      if (paymentMethod === "CartaoOnline") {
        try {
          const checkoutUrl = await createCheckoutPreference({
            items: orderItemsData.map((item) => ({
              id: item.productId,
              title: item.title || "Item do Cardápio",
              quantity: item.quantity,
              unit_price: Number(item.unitPrice),
            })),
            deliveryFee: Number(deliveryFee),
            payerEmail: "cliente@oxyfood.com",
            restaurantAccessToken: restaurant.mercadoPagoAccessToken,
            orderId: order.id,
            restaurantId: restaurant.id,
          });

          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentLink: checkoutUrl,
            },
          });

          Object.assign(order, { paymentLink: checkoutUrl });
        } catch (error) {
          console.error("Erro ao gerar Checkout:", error);
        }
      }
    }

    try {
      const io = getIO();
      io.to(restaurantId).emit("new-order", order);
    } catch (error) {
      console.error("Erro ao emitir evento de socket:", error);
    }

    return order;
  }
}
