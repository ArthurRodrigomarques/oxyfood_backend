import fastify, { FastifyError } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

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
import { planRoutes } from "./http/routes/plans.routes.js";

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

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "dev-secret",
});

app.register(fastifySwagger, {
  swagger: {
    info: {
      title: "Oxyfood API",
      description: "Documentação da API do Oxyfood Delivery e Gestão",
      version: "1.0.0",
    },
    host: "localhost:3333",
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

app.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://oxyfood-frontend-hh3z.vercel.app",
      process.env.FRONTEND_URL,
    ];

    if (!origin || allowedOrigins.includes(origin)) {
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

app.register(authRoutes);
app.register(userRoutes);
app.register(restaurantRoutes);
app.register(categoryRoutes);
app.register(productRoutes);
app.register(optionGroupRoutes);
app.register(optionRoutes);
app.register(orderRoutes);
app.register(superAdminRoutes);
app.register(reviewRoutes);
app.register(webhookRoutes);
app.register(debugRoutes);
app.register(subscriptionRoutes);
app.register(planRoutes);

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

  request.log.error(error);

  return reply.status(500).send({ message: "Internal server error." });
});
