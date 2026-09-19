import { z } from 'zod';

export const DisciplinaryCardTypeEnum = z.enum(['yellow', 'red', 'second_yellow']);

export const SuspensionReasonEnum = z.enum([
  'accumulated_yellows',
  'red_card',
  'direct_red',
  'manual',
  'season_carryover',
  'carryover',
]);

export const DisciplinaryRecordSchema = z.object({
  id: z.string().uuid(),
  tournament: z.string().uuid(),
  roster_membership: z.string().uuid(),
  player_name: z.string(),
  team_name: z.string(),
  match: z.string().uuid().nullable().optional(),
  card_type: DisciplinaryCardTypeEnum,
  minute: z.number().nullable().optional(),
  created_at: z.string(),
});

export const SuspensionSchema = z.object({
  id: z.string().uuid(),
  tournament: z.string().uuid(),
  roster_membership: z.string().uuid(),
  player_name: z.string(),
  team_name: z.string(),
  reason: SuspensionReasonEnum,
  matches_suspended: z.number(),
  matches_served: z.number(),
  is_active: z.boolean(),
  is_complete: z.boolean(),
  notes: z.string().nullable().optional(),
  created_at: z.string(),
});

export const SuspensionCarryoverSchema = z.object({
  id: z.string().uuid(),
  suspension: z.string().uuid().optional(),
  player_name: z.string().optional(),
  from_tournament: z.string().uuid().optional(),
  to_tournament: z.string().uuid().optional(),
  matches_remaining: z.number().optional(),
  created_at: z.string().optional(),
});

export const CreateManualSuspensionSchema = z.object({
  roster_membership: z.string().uuid(),
  tournament: z.string().uuid(),
  reason: z.literal('manual'),
  matches_suspended: z.number().min(1),
  notes: z.string(),
});

export type DisciplinaryCardType = z.infer<typeof DisciplinaryCardTypeEnum>;
export type DisciplinaryRecord = z.infer<typeof DisciplinaryRecordSchema>;
export type Suspension = z.infer<typeof SuspensionSchema>;
export type SuspensionCarryover = z.infer<typeof SuspensionCarryoverSchema>;
export type CreateManualSuspensionData = z.infer<typeof CreateManualSuspensionSchema>;
