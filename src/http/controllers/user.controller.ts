import { FastifyRequest, FastifyReply } from "fastify";
import { GetUserProfileUseCase } from "@/use-cases/auth/get-user-profile.use-case.js";

export class UserController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.userId;

      if (!userId) {
        throw new Error(
          "ID do usuário não encontrado (falha no middleware de autenticação)."
        );
      }

      const getUserProfile = new GetUserProfileUseCase();

      const { user } = await getUserProfile.execute({ userId });

      return reply.status(200).send({ user });
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }
}
