import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Formato de correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registerSchema = z.object({
  tipo: z.enum(["paciente", "doctor"]),
  cedula: z.string().min(10, "La cédula debe tener 10 caracteres").max(10),
  primer_nombre: z.string().min(1, "El primer nombre es requerido"),
  segundo_nombre: z.string().optional(),
  primer_apellido: z.string().min(1, "El primer apellido es requerido"),
  segundo_apellido: z.string().optional(),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().min(10, "El teléfono debe tener al menos 10 caracteres"),
  correo: z.string().email("Formato de correo inválido"),
  genero_id: z.number().int().positive("El género es requerido"),
  usuario_nombre: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  usuario_contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  usuario_imagen: z.string().optional(),
  especialidad_medica_id: z.number().int().positive().optional(),
}).refine(
  (data) => data.tipo !== "doctor" || data.especialidad_medica_id !== undefined,
  {
    message: "La especialidad médica es obligatoria para doctor",
    path: ["especialidad_medica_id"],
  }
);

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "El refresh token es requerido"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
