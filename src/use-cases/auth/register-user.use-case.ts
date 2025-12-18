import { prisma } from "@/lib/prisma.js";
import { User } from "@prisma/client";

interface RegisterUserRequest {
  name: string;
  email: string;
  password_hash: string;
}

export class RegisterUserUseCase {
  async execute({
    name,
    email,
    password_hash,
  }: RegisterUserRequest): Promise<User> {
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new Error("Este e-mail já está em uso.");
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: "OWNER",
      },
    });

    return user;
  }
}
