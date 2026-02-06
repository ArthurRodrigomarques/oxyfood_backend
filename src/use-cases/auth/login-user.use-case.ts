import { prisma } from "@/lib/prisma.js";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginUserBodySchema } from "@/schemas/auth.schema.js";

type LoginUserRequest = z.infer<typeof loginUserBodySchema>;

export class LoginUserUseCase {
  async execute({ email, password }: LoginUserRequest) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurants: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionStatus: true,
            cpfCnpj: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Credenciais inválidas.");
    }

    // Compara a senha (usando bcrypt)
    const doesPasswordMatch = await compare(password, user.password_hash);

    if (!doesPasswordMatch) {
      throw new Error("Credenciais inválidas.");
    }

    // Geração do Token JWT
    const token = jwt.sign(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "30d",
      },
    );

    // Retorna o token e os dados do usuário atualizados
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurants: user.restaurants,
      },
    };
  }
}
