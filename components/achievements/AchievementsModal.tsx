import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import {
  Award,
  X,
  CheckCircle2,
  Lock,
  Flame,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  Compass,
} from 'lucide-react-native';
import { useGetUserAchievements } from '@/features/achievements/services/achievementsApi';
import { Achievement } from '@/features/achievements/types/achievement';

interface AchievementsModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
}

// System catalog of predefined badges and their unlock rules
const BADGE_CATALOG: {
  type: string;
  category: 'fan' | 'referee' | 'player' | 'league';
  title: string;
  description: string;
  icon: any;
  color: string;
}[] = [
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
    type: 'champion',
    category: 'player',
    title: 'Campeón de Torneo',
    description: 'Levanta el trofeo y corona a tu equipo en la cima.',
    icon: Trophy,
    color: '#F59E0B',
  },
];

export function AchievementsModal({
  visible,
  onClose,
  userId,
  userName = 'Usuario',
}: AchievementsModalProps) {
  const { theme, isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<'all' | 'fan' | 'referee' | 'player'>('all');

  const { data: userAchievements = [], isLoading } = useGetUserAchievements(userId);

  // Map unlocked achievement types
  const unlockedMap = new Map<string, Achievement>();
  userAchievements.forEach((ach) => {
    unlockedMap.set(ach.achievement_type, ach);
  });

  const filteredBadges = BADGE_CATALOG.filter(
    (b) => activeCategory === 'all' || b.category === activeCategory
  );

  const unlockedCount = userAchievements.length;
  const totalCount = BADGE_CATALOG.length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' },
                ]}
              >
                <Trophy size={20} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.text }]}>Vitrina de Logros</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {unlockedCount} de {totalCount} insignias desbloqueadas
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBarBg,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, Math.round((unlockedCount / (totalCount || 1)) * 100))}%`,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            </View>
          </View>

          {/* Category Tabs */}
          <View style={styles.tabRow}>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'fan', label: 'Hincha' },
              { id: 'referee', label: 'Árbitro' },
              { id: 'player', label: 'Jugador' },
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabButton,
                    isActive && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setActiveCategory(tab.id as any)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: isActive ? '#001A2C' : theme.textSecondary },
                      isActive && { fontWeight: '800' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isLoading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.badgeList}
              showsVerticalScrollIndicator={false}
            >
              {filteredBadges.map((badge) => {
                const unlocked = unlockedMap.has(badge.type);
                const item = unlockedMap.get(badge.type);
                const IconComponent = badge.icon;

                return (
                  <View
                    key={badge.type}
                    style={[
                      styles.badgeCard,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderColor: unlocked
                          ? badge.color + '55'
                          : isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.06)',
                      },
                      unlocked && {
                        borderWidth: 1.5,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeIconBox,
                        {
                          backgroundColor: unlocked
                            ? badge.color + '22'
                            : isDark
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.05)',
                        },
                      ]}
                    >
                      <IconComponent
                        size={28}
                        color={unlocked ? badge.color : isDark ? '#6B7280' : '#9CA3AF'}
                      />
                    </View>

                    <View style={styles.badgeInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[
                            styles.badgeTitle,
                            { color: unlocked ? theme.text : theme.textSecondary },
                          ]}
                        >
                          {badge.title}
                        </Text>
                        {unlocked && <CheckCircle2 size={15} color={badge.color} />}
                      </View>
                      <Text
                        style={[
                          styles.badgeDesc,
                          { color: theme.textSecondary, opacity: unlocked ? 0.9 : 0.6 },
                        ]}
                      >
                        {badge.description}
                      </Text>

                      {unlocked && (item?.unlocked_at || item?.created_at) && (
                        <Text style={[styles.badgeDate, { color: badge.color }]}>
                          Obtenido el {new Date(item.unlocked_at || item.created_at).toLocaleDateString()}
                        </Text>
                      )}

                      {unlocked && item?.metadata && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                          {item.metadata.check_ins !== undefined && (
                            <Text style={[styles.badgeMeta, { color: theme.textSecondary }]}>
                              📍 {item.metadata.check_ins} check-ins
                            </Text>
                          )}
                          {item.metadata.matches_refereed !== undefined && (
                            <Text style={[styles.badgeMeta, { color: theme.textSecondary }]}>
                              ⚽ {item.metadata.matches_refereed} partidos arbitrados
                            </Text>
                          )}
                        </View>
                      )}
                    </View>

                    <View style={styles.badgeStatus}>
                      {unlocked ? (
                        <View
                          style={[
                            styles.unlockedBadge,
                            { backgroundColor: badge.color + '22' },
                          ]}
                        >
                          <Text style={[styles.unlockedBadgeText, { color: badge.color }]}>
                            LOGRADO
                          </Text>
                        </View>
                      ) : (
                        <Lock size={18} color={isDark ? '#6B7280' : '#9CA3AF'} />
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerLoading: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  badgeList: {
    gap: 10,
    paddingBottom: 24,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  badgeDate: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  badgeMeta: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unlockedBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
