import { z } from 'zod';

export const MarketListingSchema = z.object({
  id: z.string().uuid(),
  league: z.string().uuid(),
  league_name: z.string().optional(),
  listing_type: z.enum(['team_seeking_player', 'player_seeking_team']),
  team: z.string().uuid().nullable().optional(),
  team_name: z.string().nullable().optional(),
  player: z.string().uuid().nullable().optional(),
  player_name: z.string().nullable().optional(),
  position: z.enum(['GK', 'DEF', 'MED', 'DEL', 'SUB']).nullable().optional(),
  availability_note: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean(),
  distance_km: z.number().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MarketListing = z.infer<typeof MarketListingSchema>;

export const CreateMarketListingSchema = z.object({
  league: z.string().uuid(),
  listing_type: z.enum(['team_seeking_player', 'player_seeking_team']),
  team: z.string().uuid().optional(),
  position: z.enum(['GK', 'DEF', 'MED', 'DEL', 'SUB']).optional(),
  availability_note: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateMarketListingData = z.infer<typeof CreateMarketListingSchema>;
