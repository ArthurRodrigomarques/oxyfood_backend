import { Queue } from "bullmq";
import { env } from "../env/index.js";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASS || undefined,
};

// Criamos a fila chamada 'whatsapp-messages'
export const whatsappQueue = new Queue("whatsapp-messages", {
  connection,
  defaultJobOptions: {
    attempts: 3, // Se der erro, tenta mais 3 vezes
    backoff: {
      type: "exponential",
      delay: 1000, // Espera 1s, 2s, 4s entre as tentativas
    },
    removeOnComplete: true, // Limpa o Redis depois de terminar
  },
});
