import { FastifyRequest, FastifyReply } from "fastify";
import { CreateOrderUseCase } from "@/use-cases/restaurant/create-order.use-case.js";
import { ListRestaurantOrdersUseCase } from "@/use-cases/restaurant/list-restaurant-orders.use-case.js";
import { UpdateOrderStatusUseCase } from "@/use-cases/restaurant/update-order-status.use-case.js";
import { GetOrderStatusUseCase } from "@/use-cases/restaurant/get-order-status.use-case.js";
import { GetOrderDetailsUseCase } from "@/use-cases/order/get-order-details.use-case.js";
import {
  createOrderBodySchema,
  createOrderParamsSchema,
  getOrdersParamsSchema,
  updateOrderStatusBodySchema,
  updateOrderStatusParamsSchema,
  getOrderStatusParamsSchema,
} from "@/schemas/order.schema.js";
import { z } from "zod";
import { CancelOrderUseCase } from "@/use-cases/order/cancel-order.use-case.js";

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

  async getStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { orderId } = getOrderStatusParamsSchema.parse(request.params);

      const getStatus = new GetOrderStatusUseCase();
      const orderStatus = await getStatus.execute({ orderId });

      return reply.status(200).send(orderStatus);
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(404).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }

  // Novo método para detalhes completos
  async getDetails(request: FastifyRequest, reply: FastifyReply) {
    try {
      const getOrderDetailsParamsSchema = z.object({
        orderId: z.string().uuid(),
      });
      const { orderId } = getOrderDetailsParamsSchema.parse(request.params);

      const getDetails = new GetOrderDetailsUseCase();
      const { order } = await getDetails.execute({ orderId });

      return reply.status(200).send({ order });
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(404).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }

  async cancel(request: FastifyRequest, reply: FastifyReply) {
    try {
      const cancelOrderParamsSchema = z.object({
        orderId: z.string().uuid(),
      });

      const { orderId } = cancelOrderParamsSchema.parse(request.params);

      const userId = request.userId || "";

      const cancelOrder = new CancelOrderUseCase();
      await cancelOrder.execute({ orderId, userId });

      return reply.status(204).send();
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }
}
