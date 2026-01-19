import "dotenv/config";
import { app } from "./app.js";
import { initSocket } from "@/lib/socket.js";

const PORT = Number(process.env.PORT) || 3333;

const start = async () => {
  try {
    await app.ready();
    initSocket(app.server);

    await app.listen({
      port: PORT,
      host: "0.0.0.0",
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
