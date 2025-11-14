import { FastifyRequest, FastifyReply } from "fastify";
import { CreateOrderUseCase } from "@/use-cases/restaurant/create-order.use-case.js";
import { ListRestaurantOrdersUseCase } from "@/use-cases/restaurant/list-restaurant-orders.use-case.js";
import { UpdateOrderStatusUseCase } from "@/use-cases/restaurant/update-order-status.use-case.js";
import {
  createOrderBodySchema,
  createOrderParamsSchema,
  getOrdersParamsSchema,
  updateOrderStatusBodySchema,
  updateOrderStatusParamsSchema,
} from "@/schemas/order.schema.js";

import { z } from "zod";

export class OrderController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { restaurantId } = createOrderParamsSchema.parse(request.params);
      const body = createOrderBodySchema.parse(request.body);
      const createOrder = new CreateOrderUseCase();
      const order = await createOrder.execute({
        ...body,
        restaurantId,
      });
      return reply.status(201).send({ order });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Erro de validação.", errors: error.format() });
      }
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }

  async listByRestaurant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado (falha no middleware).");
      }
      const { restaurantId } = getOrdersParamsSchema.parse(request.params);
      const listOrders = new ListRestaurantOrdersUseCase();
      const { orders } = await listOrders.execute({
        restaurantId,
        userId,
      });
      return reply.status(200).send({ orders });
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado (falha no middleware).");
      }

      const { orderId } = updateOrderStatusParamsSchema.parse(request.params);

      const { status } = updateOrderStatusBodySchema.parse(request.body);

      const updateOrder = new UpdateOrderStatusUseCase();
      const updatedOrder = await updateOrder.execute({
        orderId,
        status,
        userId,
      });

      return reply.status(200).send({ order: updatedOrder });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Erro de validação.", errors: error.format() });
      }
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }
}
