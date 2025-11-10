import { registerUserBodySchema } from "@/schemas/auth.schema.js";
import { RegisterUserUseCase } from "@/use-cases/register-user.use-case.js";
import { hash } from "bcrypt";
import { FastifyReply, FastifyRequest } from "fastify";

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, password } = registerUserBodySchema.parse(
        request.body
      );

      const password_hash = await hash(password, 6);

      const registerUseCase = new RegisterUserUseCase();

      const user = await registerUseCase.execute({
        name,
        email,
        password_hash,
      });

      return reply.status(201).send({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error(error);
      return reply
        .status(400)
        .send({ message: "Erro ao processar a requisição." });
    }
  }
}
