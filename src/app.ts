import fastify from "fastify";
import { authRoutes } from "./http/routes/auth.routes.js";
import { userRoutes } from "./http/routes/user.routes.js";

declare module "fastify" {
  export interface FastifyRequest {
    userId: string;
  }
}

export const app = fastify();

app.decorateRequest("userId", "");

app.get("/", () => {
  return { message: "Oxyfood API Rodando" };
});

// rotas de autenticação (públicas)
app.register(authRoutes);

// rotas de usuário (protegidas)
app.register(userRoutes);
