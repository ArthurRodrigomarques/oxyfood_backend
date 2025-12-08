import { FastifyRequest, FastifyReply } from "fastify";
import {
  registerUserBodySchema,
  loginUserBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
} from "@/schemas/auth.schema.js";
import { RegisterUserUseCase } from "@/use-cases/auth/register-user.use-case.js";
import { LoginUserUseCase } from "@/use-cases/auth/login-user.use-case.js";
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { SendForgotPasswordUseCase } from "@/use-cases/auth/send-forgot-password.use-case.js";
import { ResetPasswordUseCase } from "@/use-cases/auth/reset-password.use-case.js";

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

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = forgotPasswordBodySchema.parse(request.body);
      const sendForgot = new SendForgotPasswordUseCase();
      await sendForgot.execute({ email });

      return reply.status(204).send();
    } catch (error: any) {
      console.error(error);
      return reply.status(204).send();
    }
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { token, newPassword } = resetPasswordBodySchema.parse(
        request.body
      );

      const resetPasswordUseCase = new ResetPasswordUseCase();
      await resetPasswordUseCase.execute({ token, newPassword });

      return reply.status(200).send({ message: "Senha alterada com sucesso." });
    } catch (error: any) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      return reply.status(500).send({ message: "Erro interno." });
    }
  }
}
