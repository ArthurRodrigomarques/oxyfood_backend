import { prisma } from "@/lib/prisma.js";
import { Order } from "@prisma/client";
import { z } from "zod";
import { createOrderBodySchema } from "@/schemas/order.schema.js";
import { Decimal } from "@prisma/client/runtime/library";
import { getIO } from "@/lib/socket.js";
import { generatePixPayment } from "@/lib/mercado-pago.js"; // Certifique-se de ter criado este arquivo

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
    // 1. Busca Restaurante
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new Error("Restaurante não encontrado.");
    }

    // [VALIDAÇÃO] Loja Fechada
    if (!restaurant.isOpen) {
      throw new Error("Este restaurante está fechado no momento.");
    }

    let subTotalPrice = new Decimal(0);
    const orderItemsData = [];

    // 2. Processa Itens e Preços (Segurança de Backend)
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Produto com ID ${item.productId} não encontrado.`);
      }

      // [VALIDAÇÃO] Produto Indisponível
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
      });
    }

    const deliveryFee = restaurant.deliveryFee;
    const totalPrice = subTotalPrice.add(deliveryFee);

    // 3. Cria o Pedido no Banco
    // Note que agora usamos o campo 'paymentStatus' que você adicionou no Schema
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
        paymentStatus: "PENDING", // Status inicial do pagamento

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

    // 4. Integração Mercado Pago (Apenas se for Pix e o restaurante tiver token)
    if (paymentMethod === "Pix" && restaurant.mercadoPagoAccessToken) {
      try {
        const paymentData = await generatePixPayment({
          transactionAmount: Number(totalPrice),
          description: `Pedido #${order.id.slice(0, 4).toUpperCase()} - ${
            restaurant.name
          }`,
          payerEmail: "cliente@oxyfood.com", // Pode vir do frontend futuramente
          payerFirstName: customerName.split(" ")[0],
          restaurantAccessToken: restaurant.mercadoPagoAccessToken,
          orderId: order.id,
        });

        // Atualiza o pedido com o QR Code e ID do Mercado Pago
        await prisma.order.update({
          where: { id: order.id },
          data: {
            mercadoPagoId: paymentData.id,
            paymentLink: paymentData.qrCode, // Código Copia e Cola
          },
        });

        // Injeta os dados do Pix no objeto de retorno para o Frontend exibir o QR Code na hora
        Object.assign(order, {
          qrCodeBase64: paymentData.qrCodeBase64,
          copyPaste: paymentData.qrCode,
        });
      } catch (error) {
        console.error("Erro ao gerar Pix no Mercado Pago:", error);
        // Se der erro no Pix, o pedido continua criado, mas o cliente terá que combinar outra forma ou tentar de novo.
      }
    }

    // 5. Notifica o Painel via WebSocket
    try {
      const io = getIO();
      // O 'to(restaurantId)' garante que só este restaurante receba o pedido
      io.to(restaurantId).emit("new-order", order);
    } catch (error) {
      console.error("Erro ao emitir evento de socket:", error);
    }

    return order;
  }
}
