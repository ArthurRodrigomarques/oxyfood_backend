import { prisma } from "@/lib/prisma.js";
import { hash } from "bcrypt";
import { UserRole } from "@prisma/client";
interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export class RegisterUserUseCase {
  async execute({ name, email, password, role }: RegisterUserRequest) {
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new Error("Este e-mail já está em uso.");
    }

    const password_hash = await hash(password, 6);

    const userRole = (role as UserRole) || UserRole.OWNER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: userRole,
      },
    });

    return { user };
  }
}
