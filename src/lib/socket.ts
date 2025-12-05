import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

let io: Server | null = null;
interface TokenPayload {
  sub: string;
  name: string;
  email: string;
}
interface AuthSocket extends Socket {
  data: {
    userId?: string;
  };
}

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error("Autenticação necessária."));
    }

    try {
      const tokenValue = token.replace("Bearer ", "");

      const payload = jwt.verify(
        tokenValue,
        process.env.JWT_SECRET!
      ) as TokenPayload;

      socket.data.userId = payload.sub;

      next();
    } catch (error) {
      next(new Error("Token inválido ou expirado."));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `Cliente autenticado conectado: ${socket.id} (User: ${socket.data.userId})`
    );

    socket.on("join-restaurant", (restaurantId: string) => {
      socket.join(restaurantId);
      console.log(`User ${socket.data.userId} entrou na sala ${restaurantId}`);
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
