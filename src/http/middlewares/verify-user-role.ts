import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma.js";

export function verifyUserRole(roleToVerify: "SUPER_ADMIN" | "OWNER") {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.userId;

    if (!userId) {
      return reply.status(401).send({ message: "Usuário não autenticado." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(401).send({ message: "Usuário não encontrado." });
    }

    if (user.role !== roleToVerify) {
      return reply.status(403).send({
        message: "Acesso negado. Permissão insuficiente.",
      });
    }
  };
}
