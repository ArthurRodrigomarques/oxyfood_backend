import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

export let io: Server | null = null;

interface TokenPayload {
  sub: string;
  name: string;
  email: string;
}

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://oxyfood-frontend-hh3z.vercel.app",
        process.env.FRONTEND_URL || "",
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next();
    }

    try {
      const tokenValue = token.replace("Bearer ", "");

      const payload = jwt.verify(
        tokenValue,
        process.env.JWT_SECRET!,
      ) as TokenPayload;

      socket.data.userId = payload.sub;

      next();
    } catch (error) {
      next(new Error("Token inválido ou expirado."));
    }
  });

  io.on("connection", (socket) => {
    const isAuth = !!socket.data.userId;
    console.log(
      `Conexão: ${socket.id} | Tipo: ${
        isAuth ? "Restaurante/Admin" : "Cliente Anônimo"
      }`,
    );

    socket.on("join-restaurant", (restaurantId: string) => {
      if (!socket.data.userId) {
        console.warn(
          `Tentativa não autorizada de entrar no restaurante ${restaurantId}`,
        );
        return;
      }

      socket.join(restaurantId);
      console.log(`Dono entrou na sala do restaurante: ${restaurantId}`);
    });

    socket.on("join-order", (orderId: string) => {
      socket.join(orderId);
      console.log(`Cliente entrou na sala do pedido: ${orderId}`);
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
