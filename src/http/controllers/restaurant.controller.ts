import { FastifyRequest, FastifyReply } from "fastify";
import { CreateRestaurantUseCase } from "@/use-cases/restaurant/create-restaurant.use-case.js";
import { GetPublicRestaurantUseCase } from "@/use-cases/restaurant/get-public-restaurant.use-case.js";
import { ToggleRestaurantStatusUseCase } from "@/use-cases/restaurant/toggle-restaurant-status.use-case.js";
import { GetAdminMenuUseCase } from "@/use-cases/restaurant/get-admin-menu.use-case.js";
import { UpsertOpeningHoursUseCase } from "@/use-cases/restaurant/upsert-opening-hours.use-case.js";
import {
  createRestaurantBodySchema,
  getPublicRestaurantParamsSchema,
  toggleRestaurantStatusBodySchema,
  toggleRestaurantStatusParamsSchema,
  updateRestaurantBodySchema,
  updateRestaurantParamsSchema,
} from "@/schemas/restaurant.schema.js";

import { z } from "zod";
import { UpdateRestaurantUseCase } from "@/use-cases/restaurant/update-restaurant.use-case.js";
import { GetRestaurantMetricsUseCase } from "@/use-cases/restaurant/get-restaurant-metrics.use-case.js";
import { CreateSubscriptionUseCase } from "@/use-cases/restaurant/create-subscription.use-case.js";
import { GetRestaurantByIdUseCase } from "@/use-cases/restaurant/get-restaurant-by-id.use-case.js";

export class RestaurantController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado (falha no middleware).");
      }
      const body = createRestaurantBodySchema.parse(request.body);
      const createRestaurant = new CreateRestaurantUseCase();
      const restaurant = await createRestaurant.execute({
        ...body,
        userId: userId,
      });
      return reply.status(201).send({ restaurant });
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }

  async getPublic(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = getPublicRestaurantParamsSchema.parse(request.params);
      const getRestaurant = new GetPublicRestaurantUseCase();
      const { restaurant } = await getRestaurant.execute({ slug });
      return reply.status(200).send({ restaurant });
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(404).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId!;
      const { restaurantId } = updateRestaurantParamsSchema.parse(
        request.params,
      );

      console.log("\n--- 📥 DEBUG UPDATE CONTROLLER ---");
      console.log(
        "Recebido Payload (Body):",
        JSON.stringify(request.body, null, 2),
      );

      const body = updateRestaurantBodySchema.parse(request.body);

      console.log(
        "Token MP no Body Validado:",
        body.mercadoPagoAccessToken ? "✅ PRESENTE" : "❌ AUSENTE",
      );

      const updateRestaurant = new UpdateRestaurantUseCase();
      const restaurant = await updateRestaurant.execute({
        restaurantId,
        userId,
        ...body,
      });

      console.log(
        "Update Concluído. Token salvo no DB:",
        restaurant.mercadoPagoAccessToken ? "✅ SIM" : "❌ NÃO",
      );
      console.log("----------------------------------\n");

      return reply.status(200).send({ restaurant });
    } catch (error: any) {
      console.error("❌ Erro no Update Controller:", error);
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Erro de validação", errors: error.format() });
      }
      return reply.status(400).send({ message: error.message });
    }
  }

  async toggleStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado (falha no middleware).");
      }

      const { restaurantId } = toggleRestaurantStatusParamsSchema.parse(
        request.params,
      );

      const { isOpen } = toggleRestaurantStatusBodySchema.parse(request.body);

      const toggleStatus = new ToggleRestaurantStatusUseCase();
      const updatedRestaurant = await toggleStatus.execute({
        restaurantId,
        isOpen,
        userId,
      });

      return reply.status(200).send({ restaurant: updatedRestaurant });
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

  async getMenu(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) {
        throw new Error("ID do usuário não encontrado.");
      }

      const paramsSchema = z.object({
        restaurantId: z.string().uuid(),
      });

      const { restaurantId } = paramsSchema.parse(request.params);

      const getMenu = new GetAdminMenuUseCase();
      const menu = await getMenu.execute({ restaurantId, userId });

      return reply.status(200).send(menu);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "ID Inválido" });
      }
      return reply.status(400).send({ message: error.message });
    }
  }

  async getMetrics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) throw new Error("Não autenticado.");

      const paramsSchema = z.object({
        restaurantId: z.string().uuid(),
      });

      const { restaurantId } = paramsSchema.parse(request.params);

      const getMetrics = new GetRestaurantMetricsUseCase();
      const metrics = await getMetrics.execute({ restaurantId, userId });

      return reply.status(200).send(metrics);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Dados inválidos" });
      }
      return reply.status(400).send({ message: error.message });
    }
  }

  async updateOpeningHours(request: FastifyRequest, reply: FastifyReply) {
    try {
      const paramsSchema = z.object({
        restaurantId: z.string().uuid(),
      });

      const bodySchema = z.object({
        schedules: z.array(
          z.object({
            dayOfWeek: z.number().min(0).max(6),
            openTime: z.string().regex(/^\d{2}:\d{2}$/),
            closeTime: z.string().regex(/^\d{2}:\d{2}$/),
          }),
        ),
      });

      const { restaurantId } = paramsSchema.parse(request.params);
      const { schedules } = bodySchema.parse(request.body);

      const useCase = new UpsertOpeningHoursUseCase();
      const result = await useCase.execute({ restaurantId, schedules });

      return reply.status(200).send(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Dados inválidos" });
      }
      return reply.status(400).send({ message: error.message });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      restaurantId: z.string().uuid(),
    });

    const { restaurantId } = paramsSchema.parse(request.params);

    const useCase = new GetRestaurantByIdUseCase();
    const restaurant = await useCase.execute({ restaurantId });

    return reply.send(restaurant);
  }

  async subscribe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;
      if (!userId) throw new Error("Usuário não autenticado");

      const paramsSchema = z.object({
        restaurantId: z.string().uuid(),
      });

      const bodySchema = z.object({
        plan: z.enum(["START", "PRO", "ENTERPRISE"]),
      });

      const { restaurantId } = paramsSchema.parse(request.params);
      const { plan } = bodySchema.parse(request.body);

      const createSubscription = new CreateSubscriptionUseCase();

      const result = await createSubscription.execute({
        restaurantId,
        userId,
        plan,
      });

      return reply.status(201).send(result);
    } catch (error: any) {
      console.error(error);
      return reply
        .status(400)
        .send({ message: error.message || "Erro ao criar assinatura" });
    }
  }
}
