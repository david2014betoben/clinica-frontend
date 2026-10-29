import { z } from "zod";

export const perfilSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres"),

  email: z.string().trim().email("Ingresa un email válido"),

  telefono: z
    .union([
      z
        .string()
        .trim()
        .regex(/^\d{8,15}$/, "Ingresa un teléfono válido"),
      z.literal(""),
    ])
    .optional(),
});

export type PerfilFormData = z.infer<typeof perfilSchema>;
