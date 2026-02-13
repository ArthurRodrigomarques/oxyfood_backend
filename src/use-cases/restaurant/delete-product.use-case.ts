import { prisma } from "@/lib/prisma.js";
import { utapi } from "@/lib/uploadthing.js";

interface DeleteProductRequest {
  productId: string;
  userId: string;
}

export class DeleteProductUseCase {
  async execute({ productId, userId }: DeleteProductRequest): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    console.log("ID do Dono no Banco:", product.category.restaurant.userId);
    console.log("ID do Usuário Logado:", userId);

    if (product.category.restaurant.userId !== userId) {
      throw new Error("Não autorizado.");
    }

    if (product.imageUrl) {
      const fileKey = product.imageUrl.split("/f/")[1];
      if (fileKey) {
        await utapi.deleteFiles(fileKey);
      }
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt: new Date(),
        available: false,
        imageUrl: null,
      },
    });
  }
}
