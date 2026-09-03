import { z } from 'zod';

export const CreatePaymentRecordSchema = z.object({
  league: z.string().uuid('Debe ser un UUID válido de liga'),
  amount: z
    .string()
    .min(1, 'El monto es obligatorio')
    .regex(/^\d+(\.\d{1,2})?$/, 'Formato de monto inválido (ej: 150.00)'),
  notes: z.string().max(255).optional(),
});

export type CreatePaymentRecordFormData = z.infer<typeof CreatePaymentRecordSchema>;

export const SetPaymentStatusSchema = z.object({
  status: z.enum(['up_to_date', 'pending', 'overdue']),
});

export type SetPaymentStatusFormData = z.infer<typeof SetPaymentStatusSchema>;
