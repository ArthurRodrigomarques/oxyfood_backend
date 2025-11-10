import fastify from "fastify";
import { authRoutes } from "./http/routes/auth.routes.js";

export const app = fastify();

app.get("/", () => {
  return { message: "Oxyfood API Rodando" };
});

app.register(authRoutes);
