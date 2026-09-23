import {
  Award,
  Compass,
  Flame,
  Handshake,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react-native';

export type BadgeCategory = 'fan' | 'referee' | 'player' | 'league';

export interface BadgeDefinition {
  type: string;
  category: BadgeCategory;
  title: string;
  description: string;
  icon: typeof Award;
  color: string;
}

// Catálogo de badges del sistema. Compartido entre la pantalla de logros y
// el CelebrationOverlay (evento `achievement_unlocked`), así ambos usan el
// mismo ícono/color para cada `achievement_type`.
export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    type: 'loyal_fan',
    category: 'fan',
    title: 'Hincha Fiel',
    description: 'Marca presencia en 5 partidos oficiales con check-in de hincha.',
    icon: Flame,
    color: '#F97316',
  },
  {
    type: 'match_day_regular',
    category: 'fan',
    title: 'Habitual de Cancha',
    description: 'Alcanza 20 check-ins presenciales apoyando a tus equipos en la cancha.',
    icon: Trophy,
    color: '#EAB308',
  },
  {
    type: 'referee_10',
    category: 'referee',
    title: 'Árbitro Consagrado (10)',
    description: 'Oficia y califica con éxito 10 partidos oficiales.',
    icon: ShieldCheck,
    color: '#06B6D4',
  },
  {
    type: 'referee_50',
    category: 'referee',
    title: 'Árbitro Leyenda (50)',
    description: '50 partidos arbitrados manteniendo un alto estándar de juego.',
    icon: Star,
    color: '#8B5CF6',
  },
  {
    type: 'first_day',
    category: 'player',
    title: 'Debutante',
    description: 'Crea tu perfil de jugador y juega tu primer partido.',
    icon: Compass,
    color: '#10B981',
  },
  {
    type: 'mvp_week',
    category: 'player',
    title: 'MVP de la Semana',
    description: 'Elegido el jugador más valioso de la fecha por votación y rating.',
    icon: Trophy,
    color: '#F59E0B',
  },
  {
    type: 'top_scorer',
    category: 'player',
    title: 'Bota de Oro',
    description: 'Máximo goleador de la temporada en un torneo oficial.',
    icon: Award,
    color: '#EF4444',
  },
  {
    type: 'most_assists',
    category: 'player',
    title: 'Rey de las Asistencias',
    description: 'Máximo asistidor de la temporada en un torneo oficial.',
    icon: Target,
    color: '#3B82F6',
  },
  {
    type: 'hat_trick',
    category: 'player',
    title: 'Hat-Trick',
    description: 'Anota tres goles en un mismo partido oficial.',
    icon: Zap,
    color: '#EC4899',
  },
  {
    type: 'best_xi',
    category: 'player',
    title: 'Once Ideal',
    description: 'Seleccionado en el once ideal de la fecha.',
    icon: Users,
    color: '#14B8A6',
  },
  {
    type: 'fair_play',
    category: 'player',
    title: 'Juego Limpio',
    description: 'Completa la temporada sin tarjetas rojas ni sanciones.',
    icon: Handshake,
    color: '#22C55E',
  },
  {
    type: 'champion',
    category: 'player',
    title: 'Campeón de Torneo',
    description: 'Levanta el trofeo y corona a tu equipo en la cima.',
    icon: Trophy,
    color: '#F59E0B',
  },
];

export const getBadgeDefinition = (achievementType: string) =>
  BADGE_CATALOG.find((badge) => badge.type === achievementType);
