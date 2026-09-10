import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { User } from 'lucide-react-native';
import { Player } from '@/features/players/types/player';

interface PlayerAvatarProps {
  player: Player;
  theme: any;
  isDark: boolean;
}

export function PlayerAvatar({ player, theme, isDark }: PlayerAvatarProps) {
  const styles = createStyles(theme, isDark);
  const displayName = player.nickname || player.full_name.split(' ')[0];

  return (
    <View style={styles.playerContainer}>
      <View style={[styles.avatarBorder, !player.photo && styles.avatarPlaceholder]}>
        {player.photo ? (
          <Image 
            source={{ uri: player.photo }} 
            style={styles.avatarImage} 
          />
        ) : (
          <User size={24} color={theme.primary} />
        )}
      </View>
      <Text style={[styles.playerName, { color: theme.text }]}>{displayName}</Text>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  playerContainer: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  avatarBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.primary,
    padding: 2,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  playerName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
