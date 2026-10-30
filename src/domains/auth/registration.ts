import { z } from "zod";
export const registerAccountSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").max(100),
  email: z.string().trim().toLowerCase().email("Informe um email válido."),
  phone: z
    .string()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .refine(
      (value) => /^\+?[1-9]\d{7,14}$/.test(value),
      "Informe o telefone com DDD e código do país."
    ),
  password: z
    .string()
    .min(8, "Use pelo menos 8 caracteres.")
    .max(72)
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      "A senha precisa ter uma letra e um número."
    ),
});
export const registerFormSchema = registerAccountSchema
  .extend({ confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"],
  });
export type RegisterAccount = z.output<typeof registerAccountSchema>;
export type RegisterForm = z.input<typeof registerFormSchema>;
