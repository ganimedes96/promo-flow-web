import { z } from "zod";
export const registerAccountSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").max(100),
  email: z.string().trim().toLowerCase().email("Informe um email válido."),
  phone: z
    .string()
    .transform((value) => {
      const digits = value.replace(/[^\d]/g, "");
      return digits.length === 11 ? `+55${digits}` : `+${digits}`;
    })
    .refine(
      (value) => /^\+55[1-9]\d9\d{8}$/.test(value),
      "Informe um celular válido com DDD, como (85) 99999-9999."
    ),
  password: z.string().min(6, "Use pelo menos 6 caracteres.").max(72),
});
export const registerFormSchema = registerAccountSchema
  .extend({ confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"],
  });
export type RegisterAccount = z.output<typeof registerAccountSchema>;
export type RegisterForm = z.input<typeof registerFormSchema>;
