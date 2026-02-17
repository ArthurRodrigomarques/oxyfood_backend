import "dotenv/config";
import { initSentry } from "@/lib/sentry.js";
import "./workers/whatsapp.worker.js";
import { env } from "./env/index.js";

initSentry();

import { app } from "./app.js";
import { initSocket } from "@/lib/socket.js";
import { prisma } from "@/lib/prisma.js";

const PORT = Number(process.env.PORT) || 3333;

const start = async () => {
  try {
    await app.ready();
    initSocket(app.server);

    await app.listen({
      port: PORT,
      host: "0.0.0.0",
    });

    console.log(`🚀 HTTP Server Running on port ${PORT}!`);
    console.log(`📑 API Documentation: http://localhost:${env.PORT}/docs`);

    // --- Graceful Shutdown ---

    // executa a limpeza
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Recebido sinal ${signal}. Encerrando com segurança...`);

      try {
        // 1. Para de receber novas requisições e espera as atuais terminarem
        await app.close();
        console.log("✅ Servidor HTTP fechado.");

        // 2. Fecha a conexão com o banco de dados
        await prisma.$disconnect();
        console.log("✅ Conexão com Banco de Dados fechada.");

        process.exit(0); // Sai com sucesso
      } catch (err) {
        console.error("❌ Erro ao encerrar:", err);
        process.exit(1); // Sai com erro
      }
    };

    // Ouve os sinais de encerramento do SO ou do Deploy
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
