import { prisma } from "@/lib/prisma.js";
import { getMailClient } from "@/lib/mail.js";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";

interface SendForgotPasswordRequest {
  email: string;
}

export class SendForgotPasswordUseCase {
  async execute({ email }: SendForgotPasswordRequest): Promise<void> {
    // 1. Verifica se usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    // 2. Gera token e data de expiração (1 hora)
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // 3. Salva no banco
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // 4. Envia o E-mail
    const mailClient = await getMailClient();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const message = await mailClient.sendMail({
      from: `OxyFood <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Recuperação de Senha - OxyFood",
      html: `
        <div style="font-family: sans-serif; font-size: 16px; color: #111;">
          <p>Olá, <strong>${user.name}</strong>!</p>
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <p>
            <a href="${resetLink}" style="background: #f97316; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Redefinir Minha Senha
            </a>
          </p>
          <p>Ou copie o link: ${resetLink}</p>
          <p>Se você não solicitou, ignore este e-mail.</p>
        </div>
      `,
    });

    console.log(
      "📧 URL de Teste do E-mail:",
      nodemailer.getTestMessageUrl(message),
    );
  }
}
