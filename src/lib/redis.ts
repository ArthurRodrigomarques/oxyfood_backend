import { Redis } from "ioredis";
import { env } from "../env/index.js";

export const redis = new Redis(env.REDIS_URL);

redis.on("connect", () => {
  console.log("🚩 Redis conectado com sucesso!");
});

redis.on("error", (err) => {
  console.error("❌ Erro no Redis:", err);
});
