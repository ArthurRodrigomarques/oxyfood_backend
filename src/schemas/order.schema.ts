import { z } from "zod";

const OrderItemSchema = z.object({
  productId: z.string().uuid({ message: "ID de produto inválido." }),
  quantity: z
    .number()
    .int({ message: "A quantidade deve ser um número inteiro." })
    .positive({ message: "A quantidade deve ser pelo menos 1." }),
  options: z.array(z.string().uuid()).optional(),
});

// Criar Pedido
export const createOrderBodySchema = z.object({
  customerName: z.string().min(3, { message: "O nome é obrigatório." }),
  customerPhone: z.string().min(9, { message: "Telefone inválido." }),
  customerAddress: z.string().min(10, { message: "Morada inválida." }),
  paymentMethod: z.enum(["Dinheiro", "Pix", "Cartao"], {
    message: "Método de pagamento deve ser 'Dinheiro', 'Pix' ou 'Cartao'.",
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
