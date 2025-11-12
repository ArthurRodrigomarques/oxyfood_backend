import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
  sub: string;
}

export function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({
      message: "Token de autenticação não fornecido.",
    });
  }

  const [, token] = authHeader.split(" ");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    request.userId = payload.sub;

    done();
  } catch (error) {
    return reply.status(401).send({
      message: "Token inválido ou expirado.",
    });
  }
}
