import "dotenv/config";
import { app } from "./app.js";
import { initSocket } from "@/lib/socket.js";

const PORT = Number(process.env.PORT) || 3333;

app.ready().then(() => {
  initSocket(app.server);

  app
    .listen({
      port: PORT,
      host: "0.0.0.0",
    })
    .then(() => {
      console.log(
        `HTTP & WebSocket server running on http://localhost:${PORT}`
      );
    });
});
