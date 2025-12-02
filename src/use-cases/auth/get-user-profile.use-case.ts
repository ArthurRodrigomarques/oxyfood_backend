import { prisma } from "@/lib/prisma.js";

interface GetUserProfileRequest {
  userId: string;
}
interface GetUserProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    restaurants: {
      id: string;
      name: string;
      slug: string;
    }[];
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
      throw new Error("Usuário não encontrado.");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        restaurants: user.restaurants,
      },
    };
  }
}
