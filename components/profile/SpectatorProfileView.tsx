import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { SpectatorProfile, Favorite } from '@/features/auth/types/auth';
import { router } from 'expo-router';
import {
  Eye,
  MapPin,
  Heart,
  Globe,
  Lock,
  Trophy,
  Users,
  Compass,
} from 'lucide-react-native';

interface SpectatorProfileViewProps {
  spectator: SpectatorProfile;
  fullName: string;
  username: string;
  favorites?: Favorite[];
}

export function SpectatorProfileView({
  spectator,
  fullName,
  username,
  favorites = [],
}: SpectatorProfileViewProps) {
  const { theme, isDark } = useTheme();

  const favoriteTeams = favorites.filter((f) => f.team || f.team_name || f.favorite_type === 'team');
  const favoriteLeagues = favorites.filter((f) => f.league || f.league_name || f.favorite_type === 'league');

  return (
    <View style={styles.container}>
      {/* Fan Hero Card */}
      <View
        style={[
          styles.fanCard,
          {
            backgroundColor: theme.surface,
            borderColor: isDark
              ? 'rgba(6, 182, 212, 0.25)'
              : 'rgba(6, 182, 212, 0.2)',
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: '#06B6D420', borderColor: '#06B6D450' },
            ]}
          >
            <Heart size={26} color="#06B6D4" fill="#06B6D4" />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.visibilityPill,
                  {
                    backgroundColor: spectator.is_public
                      ? '#10B9811A'
                      : '#64748B1A',
                  },
                ]}
              >
                {spectator.is_public ? (
                  <Eye size={12} color="#10B981" />
                ) : (
                  <Lock size={12} color="#64748B" />
                )}
                <Text
                  style={[
                    styles.visibilityText,
                    { color: spectator.is_public ? '#10B981' : '#64748B' },
                  ]}
                >
                  {spectator.is_public ? 'PÚBLICO' : 'PRIVADO'}
                </Text>
              </View>
            </View>

            <Text style={[styles.nameText, { color: theme.text }]}>
              {fullName}
            </Text>
            <Text style={[styles.handleText, { color: theme.textSecondary }]}>
              @{username}
            </Text>
          </View>
        </View>

        {/* Bio & Location */}
        <View style={styles.bioContainer}>
          <Text style={[styles.bioText, { color: theme.text }]}>
            {spectator.bio || 'Aficionado y seguidor de las mejores ligas en Trofi.'}
          </Text>

          {spectator.city ? (
            <View style={styles.locationRow}>
              <MapPin size={13} color={theme.textSecondary} />
              <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                {spectator.city}
              </Text>
            </View>
          ) : null}
        </View>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <View
            style={[
              styles.kpiBox,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.02)',
              },
            ]}
          >
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {favoriteTeams.length}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              EQUIPOS SEGUIDOS
            </Text>
          </View>

          <View
            style={[
              styles.kpiBox,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.02)',
              },
            ]}
          >
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {favoriteLeagues.length}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              LIGAS FAVORITAS
            </Text>
          </View>

          <View
            style={[
              styles.kpiBox,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.02)',
              },
            ]}
          >
            <Text style={[styles.kpiValue, { color: '#06B6D4' }]}>
              {(spectator.preferred_language || 'ES').toUpperCase()}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              IDIOMA
            </Text>
          </View>
        </View>
      </View>

      {/* Favorites Section */}
      <View style={styles.favoritesSection}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          MIS FAVORITOS
        </Text>

        {favorites.length > 0 ? (
          <View style={styles.favoritesList}>
            {favorites.map((fav) => (
              <View
                key={fav.id}
                style={[
                  styles.favItem,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
              >
                <View style={styles.favIconBox}>
                  {fav.team_name ? (
                    <Users size={16} color="#06B6D4" />
                  ) : (
                    <Trophy size={16} color="#F59E0B" />
                  )}
                </View>
                <View style={styles.favTextBox}>
                  <Text style={[styles.favTitle, { color: theme.text }]}>
                    {fav.team_name || fav.league_name || fav.tournament_name || 'Favorito'}
                  </Text>
                  <Text style={[styles.favType, { color: theme.textSecondary }]}>
                    {fav.favorite_type ? fav.favorite_type.toUpperCase() : 'SEGUIDO'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyFavBox,
              {
                backgroundColor: theme.surface,
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
              },
            ]}
          >
            <Heart size={36} color={theme.textSecondary} opacity={0.4} />
            <Text style={[styles.emptyFavTitle, { color: theme.text }]}>
              Aún no tienes favoritos
            </Text>
            <Text style={[styles.emptyFavSub, { color: theme.textSecondary }]}>
              Sigue equipos, ligas y jugadores para recibir avisos y novedades en tu perfil.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)/leagues')}
              activeOpacity={0.7}
            >
              <Compass size={16} color="#FFFFFF" />
              <Text style={styles.exploreBtnText}>Explorar Ligas</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  fanCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  visibilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  visibilityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  nameText: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  handleText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bioContainer: {
    marginBottom: 20,
    gap: 8,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  favoritesSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  favoritesList: {
    gap: 10,
  },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  favIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favTextBox: {
    flex: 1,
  },
  favTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  favType: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyFavBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyFavTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  emptyFavSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#06B6D4',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44, // Fitts's Law 44pt touch target
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
