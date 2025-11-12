import { email, z } from "zod";

export const registerUserBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome precisa ter no mínimo 3 caracteres." }),
  email: z.string().email({ message: "Formato de e-mail inválido." }),
  password: z
    .string()
    .min(6, { message: "A senha precisa ter no mínimo 6 caracteres." }),
});

export const loginUserBodySchema = z.object({
  email: z.string().email({ message: "Formato de e-mail inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha precisa ter no mínimo 6 caracteres." }),
});
