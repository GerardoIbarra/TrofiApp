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

export const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
});

export const resetPasswordSchema = z.object({
  uid: z.string().min(1, 'UID es requerido'),
  token: z.string().min(1, 'Token es requerido'),
  new_password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  new_password2: z.string().min(6, 'La confirmación es requerida'),
}).refine((data) => data.new_password === data.new_password2, {
  message: "Las contraseñas no coinciden",
  path: ["new_password2"],
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'La contraseña actual es requerida'),
  new_password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  new_password2: z.string().min(6, 'La confirmación es requerida'),
}).refine((data) => data.new_password === data.new_password2, {
  message: "Las contraseñas no coinciden",
  path: ["new_password2"],
});

export const editProfileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Ingresa un correo válido').optional().or(z.literal('')),
  phone: z.string().optional(),
  photo: z.string().optional(), // base64
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type EditProfileSchema = z.infer<typeof editProfileSchema>;
