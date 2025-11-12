import { prisma } from "@/lib/prisma.js";
import { User } from "@prisma/client"; // Lembre-se: npx prisma generate se isto der erro

// ID do usuário
interface GetUserProfileRequest {
  userId: string;
}

// o usuário, sem a senha
interface GetUserProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}

export class GetUserProfileUseCase {
  async execute({
    userId,
  }: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}
