import fastify from "fastify";
import { authRoutes } from "./http/routes/auth.routes.js";
import { userRoutes } from "./http/routes/user.routes.js";
import { restaurantRoutes } from "./http/routes/restaurant.routes.js";
import { categoryRoutes } from "./http/routes/category.routes.js";
import { productRoutes } from "./http/routes/product.routes.js";
import { optionGroupRoutes } from "./http/routes/option-group.routes.js";

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
