import fastify from "fastify";
import cors from "@fastify/cors";

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
import { env } from "process";
import { ZodError } from "zod";

declare module "fastify" {
  export interface FastifyRequest {
    userId: string | null;
  }
}

export const app = fastify();

app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.decorateRequest("userId", null);

// Rota de hello world
app.get("/", () => {
  return { message: "Oxyfood API Rodando" };
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

app.register(webhookRoutes);

app.register(debugRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: "Validation error.", issues: error.format() });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    // TODO: Log to external tool
  }

  return reply.status(500).send({ message: "Internal server error." });
});
