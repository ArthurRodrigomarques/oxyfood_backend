import fastify from "fastify";
import { authRoutes } from "./http/routes/auth.routes.js";
import { userRoutes } from "./http/routes/user.routes.js";
import { restaurantRoutes } from "./http/routes/restaurant.routes.js";

declare module "fastify" {
  export interface FastifyRequest {
    userId: string | null;
  }
}

export const app = fastify();

app.decorateRequest("userId", null);

app.get("/", () => {
  return { message: "Oxyfood API Rodando" };
});

app.register(authRoutes);
app.register(userRoutes);
app.register(restaurantRoutes);
