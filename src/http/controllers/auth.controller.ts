import { FastifyRequest, FastifyReply } from "fastify";
import {
  registerUserBodySchema,
  loginUserBodySchema,
} from "@/schemas/auth.schema.js";
import { RegisterUserUseCase } from "@/use-cases/register-user.use-case.js";
import { LoginUserUseCase } from "@/use-cases/login-user.use-case.js";
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";

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
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = loginUserBodySchema.parse(request.body);
      const loginUseCase = new LoginUserUseCase();
      const user = await loginUseCase.execute({ email, password });

      const token = jwt.sign(
        {
          name: user.name,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        {
          subject: user.id,
          expiresIn: "7d",
        }
      );

      return reply.status(200).send({
        message: "Login bem-sucedido!",
        token: token,
      });
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(401).send({ message: error.message });
      }
      console.error(error);
      return reply.status(500).send({ message: "Erro interno do servidor." });
    }
  }
}
