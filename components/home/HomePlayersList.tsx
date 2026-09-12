import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { Player } from '@/features/players/types/player';

interface HomePlayersListProps {
  players: Player[];
  isLoading: boolean;
  onAddPlayer: () => void;
  onSeeAll: () => void;
  onSelectPlayer: (playerId: string) => void;
}

export const HomePlayersList = React.memo(function HomePlayersList({
  players,
  isLoading,
  onAddPlayer,
  onSeeAll,
  onSelectPlayer,
}: HomePlayersListProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[GlobalStyles.sectionTitle, { color: theme.text }]}>
          {t('home.players')}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={onAddPlayer}
            style={styles.actionIcon}
            activeOpacity={0.7}
          >
            <Plus size={20} color={theme.primary} />
          </TouchableOpacity>
          {players.length > 0 && (
            <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>{t('common.see_all')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={theme.primary}
          style={{ marginLeft: 20, marginTop: 20 }}
        />
      ) : players.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No se encontraron jugadores
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playersScrollContent}
        >
          {players.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => onSelectPlayer(item.id)}
            >
              <PlayerAvatar player={item} theme={theme} isDark={isDark} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 10,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      marginBottom: 15,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    seeAllText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.primary,
    },
    emptyText: {
      fontSize: 12,
      marginLeft: 20,
      fontStyle: 'italic',
    },
    playersScrollContent: {
      paddingRight: 20,
      marginBottom: 20,
    },
  });
