import fastify, { FastifyError } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { env } from "process";
import { ZodError } from "zod";

import { authRoutes } from "./http/routes/auth.routes.js";
import { userRoutes } from "./http/routes/user.routes.js";
import { restaurantRoutes } from "./http/routes/restaurant.routes.js";
import { categoryRoutes } from "./http/routes/category.routes.js";
import { productRoutes } from "./http/routes/product.routes.js";
import { optionGroupRoutes } from "./http/routes/option-group.routes.js";
import { optionRoutes } from "./http/routes/option.route.js";
import { orderRoutes } from "./http/routes/order.routes.js";
import { webhookRoutes } from "./http/routes/webhook.routes.js";
import { debugRoutes } from "./http/routes/debug.route.js";
import { superAdminRoutes } from "./http/routes/super-admin.routes.js";
import { reviewRoutes } from "./http/routes/review.routes.js";
import { subscriptionRoutes } from "./http/routes/subscription.route.js";

declare module "fastify" {
  export interface FastifyRequest {
    userId: string | null;
  }
}

export const app = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        colorize: true,
      },
    },
  },
});

app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

app.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
    if (!origin || origin === allowedOrigin) {
      cb(null, true);
      return;
    }
    if (process.env.NODE_ENV === "development") {
      cb(null, true);
      return;
    }
    cb(new Error("Not allowed"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.decorateRequest("userId", null);

app.get("/", () => {
  return { message: "Oxyfood API Rodando", status: "operational" };
});

//autenticação
app.register(authRoutes);
// login
app.register(userRoutes);
// criar restaurante
app.register(restaurantRoutes);
// criar nova categoria de produto
app.register(categoryRoutes);
// registrar novos produtos
app.register(productRoutes);
// opções do produto
app.register(optionGroupRoutes);
// Opção
app.register(optionRoutes);
// pedidos
app.register(orderRoutes);

app.register(superAdminRoutes);

app.register(reviewRoutes);

app.register(webhookRoutes);

app.register(debugRoutes);

app.register(subscriptionRoutes);

app.setErrorHandler((error: FastifyError, request, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: "Validation error.", issues: error.format() });
  }

  if (error.statusCode === 429) {
    return reply
      .status(429)
      .send({ message: "Muitas requisições. Tente novamente mais tarde." });
  }

  if (process.env.NODE_ENV !== "production") {
    request.log.error(error);
  } else {
    request.log.error(error);
  }

  return reply.status(500).send({ message: "Internal server error." });
});
