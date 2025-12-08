import { prisma } from "@/lib/prisma.js";
import { hash } from "bcrypt";

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  async execute({ token, newPassword }: ResetPasswordRequest): Promise<void> {
    // 1. Busca o token no banco
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      throw new Error("Token inválido.");
    }

    // 2. Validações
    if (tokenRecord.used) {
      throw new Error("Este token já foi utilizado.");
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new Error("Token expirado.");
    }

    // 3. Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.email },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    // 4. Atualiza a senha
    const passwordHash = await hash(newPassword, 6);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: passwordHash },
    });

    // 5. Marca o token como usado
    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    });
  }
}
