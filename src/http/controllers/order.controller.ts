import { FastifyRequest, FastifyReply } from "fastify";
import { CreateOrderUseCase } from "@/use-cases/restaurant/create-order.use-case.js";
import {
  createOrderBodySchema,
  createOrderParamsSchema,
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
        return reply.status(400).send({
          message: "Erro de validação.",
          errors: error.format(),
        });
      }
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }
}
