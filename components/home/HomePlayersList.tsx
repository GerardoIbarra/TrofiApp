import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Plus, Star, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { Player } from '@/features/players/types/player';

interface HomePlayersListProps {
  players: Player[];
  isLoading: boolean;
  onAddPlayer: () => void;
  onSeeAll: () => void;
  onSelectPlayer: (playerId: string) => void;
}

const getInitials = (name: string): string => {
  if (!name) return 'PL';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const HomePlayersList = React.memo(function HomePlayersList({
  players,
  isLoading,
  onAddPlayer,
  onSeeAll,
  onSelectPlayer,
}: HomePlayersListProps) {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const styles = createStyles(theme, isDark);
  const isEn = i18n.language === 'en';

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionOverline}>
            {isEn ? 'FEATURED TALENT' : 'TALENTO DESTACADO'}
          </Text>
          <Text style={[GlobalStyles.sectionTitle, { color: theme.text }]}>
            {t('home.players')}
          </Text>
        </View>
        {players.length > 0 && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>{t('common.see_all')}</Text>
            <ChevronRight size={14} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.primary} size="small" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playersScrollContent}
        >
          {/* Tarjeta para Crear / Añadir Jugador */}
          <TouchableOpacity
            style={styles.addPlayerCard}
            activeOpacity={0.8}
            onPress={onAddPlayer}
          >
            <View style={styles.addIconCircle}>
              <Plus size={22} color="#001A2C" />
            </View>
            <Text style={styles.addCardTitle}>
              {isEn ? 'Create Player' : 'Crear Jugador'}
            </Text>
            <Text style={styles.addCardSubtitle}>
              {isEn ? 'Build your card' : 'Crea tu ficha'}
            </Text>
          </TouchableOpacity>

          {/* Tarjetas de Jugadores */}
          {players.map((item) => {
            const displayName = item.full_name || 'Jugador';
            const positionText = item.position || (isEn ? 'PLAYER' : 'JUGADOR');
            const rating = item.overall_rating;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.playerCard}
                activeOpacity={0.85}
                onPress={() => onSelectPlayer(item.id)}
              >
                {/* Header de la Tarjeta: Posición y Rating */}
                <View style={styles.cardHeader}>
                  <View style={styles.positionBadge}>
                    <Text style={styles.positionText}>{positionText}</Text>
                  </View>
                  {rating ? (
                    <View style={styles.ratingBadge}>
                      <Star size={10} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{rating}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Avatar Central */}
                <View style={styles.avatarWrapper}>
                  {item.photo ? (
                    <Image
                      source={{ uri: item.photo }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>
                        {getInitials(displayName)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Info Inferior */}
                <View style={styles.cardFooter}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.playerSub} numberOfLines={1}>
                    {item.nickname ? `"${item.nickname}"` : (isEn ? 'Active' : 'Activo')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 15,
      marginBottom: 10,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    sectionOverline: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingBottom: 4,
    },
    seeAllText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.primary,
      letterSpacing: 0.5,
    },
    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playersScrollContent: {
      paddingRight: 20,
      paddingBottom: 10,
      gap: 12,
    },
    addPlayerCard: {
      width: 140,
      height: 190,
      borderRadius: 20,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: isDark ? 'rgba(0, 245, 255, 0.3)' : 'rgba(0, 163, 172, 0.35)',
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.03)' : 'rgba(0, 163, 172, 0.03)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
    },
    addIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    addCardTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    addCardSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    playerCard: {
      width: 140,
      height: 190,
      borderRadius: 20,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
      padding: 12,
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.08,
      shadowRadius: 8,
      elevation: isDark ? 0 : 3,
    },
    cardHeader: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    positionBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 163, 172, 0.1)',
    },
    positionText: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.primary,
      letterSpacing: 0.5,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.15)',
    },
    ratingText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#F59E0B',
    },
    avatarWrapper: {
      width: 62,
      height: 62,
      borderRadius: 31,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(0, 245, 255, 0.4)' : 'rgba(0, 163, 172, 0.4)',
      padding: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 4,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 27,
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 27,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.primary,
      letterSpacing: 0.5,
    },
    cardFooter: {
      width: '100%',
      alignItems: 'center',
    },
    playerName: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      width: '100%',
    },
    playerSub: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 2,
      width: '100%',
    },
  });
