import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import {
  registerUserBodySchema,
  loginUserBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
} from "@/schemas/auth.schema.js";
import { RegisterUserUseCase } from "@/use-cases/auth/register-user.use-case.js";
import { LoginUserUseCase } from "@/use-cases/auth/login-user.use-case.js";
import { SendForgotPasswordUseCase } from "@/use-cases/auth/send-forgot-password.use-case.js";
import { ResetPasswordUseCase } from "@/use-cases/auth/reset-password.use-case.js";

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = registerUserBodySchema.parse(request.body);
      const registerUseCase = new RegisterUserUseCase();
      const { user } = await registerUseCase.execute(body);

      return reply.status(201).send({ user });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Dados inválidos", errors: error.format() });
      }
      return reply
        .status(400)
        .send({ message: error.message || "Erro ao registrar" });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = loginUserBodySchema.parse(request.body);
      const loginUseCase = new LoginUserUseCase();
      const { token, user } = await loginUseCase.execute(body);

      return reply.status(200).send({
        message: "Login realizado com sucesso!",
        token,
        user,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Dados inválidos.", errors: error.format() });
      }
      if (error.message === "Credenciais inválidas.") {
        return reply.status(401).send({ message: error.message });
      }
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
      console.error("Erro no envio de e-mail:", error);
      return reply.status(204).send();
    }
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { token, newPassword } = resetPasswordBodySchema.parse(
        request.body,
      );

      const resetPasswordUseCase = new ResetPasswordUseCase();
      await resetPasswordUseCase.execute({ token, newPassword });

      return reply.status(200).send({ message: "Senha alterada com sucesso." });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Dados inválidos.", errors: error.format() });
      }
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      return reply.status(500).send({ message: "Erro interno." });
    }
  }
}
