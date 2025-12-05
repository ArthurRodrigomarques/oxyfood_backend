import { prisma } from "@/lib/prisma.js";
import { Order } from "@prisma/client";
import { z } from "zod";
import { createOrderBodySchema } from "@/schemas/order.schema.js";
import { Decimal } from "@prisma/client/runtime/library";
import { getIO } from "@/lib/socket.js";

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
    if (!restaurant) throw new Error("Restaurante não encontrado.");

    let subTotalPrice = new Decimal(0);
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) throw new Error("Produto não encontrado");

      const selectedOptions = await prisma.option.findMany({
        where: { id: { in: item.options || [] } },
      });
      const optionsPrice = selectedOptions.reduce(
        (acc, opt) => acc.add(opt.priceDelta),
        new Decimal(0)
      );
      const unitPrice = product.basePrice.add(optionsPrice);

      subTotalPrice = subTotalPrice.add(unitPrice.mul(item.quantity));

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        optionsDescription: selectedOptions.map((o) => o.name).join(", "),
      });
    }

    const deliveryFee = restaurant.deliveryFee;
    const totalPrice = subTotalPrice.add(deliveryFee);

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        paymentMethod,
        trocoPara,
        subTotalPrice,
        deliveryFee,
        totalPrice,
        restaurantId: restaurantId,
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

    try {
      const io = getIO();
      io.to(restaurantId).emit("new-order", order);
    } catch (error) {
      console.error("Erro ao emitir socket:", error);
    }

    return order;
  }
}
