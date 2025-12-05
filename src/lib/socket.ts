import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("join-restaurant", (restaurantId: string) => {
      socket.join(restaurantId);
      console.log(`Socket ${socket.id} entrou na sala ${restaurantId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io não foi inicializado!");
  }
  return io;
}
