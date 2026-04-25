import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'El correo o usuario es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Ingresa un correo válido'),
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  password2: z.string().min(6, 'La confirmación es requerida'),
}).refine((data) => data.password === data.password2, {
  message: "Las contraseñas no coinciden",
  path: ["password2"],
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
