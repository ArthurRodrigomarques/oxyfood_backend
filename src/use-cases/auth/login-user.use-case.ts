import { prisma } from "@/lib/prisma.js";
import { compare } from "bcrypt";
import { z } from "zod";
import { loginUserBodySchema } from "@/schemas/auth.schema.js";

interface LoginUserResponse {
  id: string;
  name: string;
  email: string;
  restaurants: {
    id: string;
    name: string;
    slug: string;
  }[];
}

type LoginUserRequest = z.infer<typeof loginUserBodySchema>;

export class LoginUserUseCase {
  async execute({
    email,
    password,
  }: LoginUserRequest): Promise<LoginUserResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurants: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Credenciais inválidas.");
    }

    const doesPasswordMatch = await compare(password, user.password_hash);

    if (!doesPasswordMatch) {
      throw new Error("Credenciais inválidas.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      restaurants: user.restaurants,
    };
  }
}
