import { z } from "zod";
import { OrderStatus } from "@prisma/client";

const OrderItemSchema = z.object({
  productId: z.string().uuid({ message: "ID de produto inválido." }),
  quantity: z
    .number()
    .int({ message: "A quantidade deve ser um número inteiro." })
    .positive({ message: "A quantidade deve ser pelo menos 1." }),
  options: z.array(z.string().uuid()).optional(),
  observation: z.string().optional(),
});

export const createOrderBodySchema = z.object({
  customerName: z.string().min(3, { message: "O nome é obrigatório." }),
  customerPhone: z.string().min(9, { message: "Telefone inválido." }),
  customerAddress: z.string().min(10, { message: "Morada inválida." }),
  paymentMethod: z.enum(["Dinheiro", "Pix", "Cartao", "CartaoOnline"], {
    message: "Método de pagamento inválido.",
  }),
  trocoPara: z.coerce.number().positive().optional(),
  items: z
    .array(OrderItemSchema)
    .min(1, { message: "O carrinho não pode estar vazio." }),
});

export const createOrderParamsSchema = z.object({
  restaurantId: z.string().uuid({ message: "ID do restaurante inválido." }),
});

export const getOrdersParamsSchema = z.object({
  restaurantId: z.string().uuid({ message: "ID do restaurante inválido." }),
});

export const updateOrderStatusParamsSchema = z.object({
  orderId: z.string().uuid({ message: "ID do pedido inválido." }),
});

export const updateOrderStatusBodySchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    message: "Status inválido.",
  }),
});

export const getOrderStatusParamsSchema = z.object({
  orderId: z.string().uuid({ message: "ID do pedido inválido." }),
});
