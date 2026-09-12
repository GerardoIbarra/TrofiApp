import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Player } from '@/features/players/types/player';

interface PlayerAvatarProps {
  player: Player;
  theme: any;
  isDark: boolean;
}

function getInitials(name: string): string {
  if (!name) return 'P';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PlayerAvatar({ player, theme, isDark }: PlayerAvatarProps) {
  const styles = createStyles(theme, isDark);
  const displayName = player.nickname || player.full_name.split(' ')[0];
  const initials = getInitials(player.nickname || player.full_name);

  return (
    <View style={styles.playerContainer}>
      <View style={[styles.avatarBorder, !player.photo && styles.avatarPlaceholder]}>
        {player.photo ? (
          <Image 
            source={{ uri: player.photo }} 
            style={styles.avatarImage} 
          />
        ) : (
          <Text style={[styles.initialsText, { color: theme.primary }]}>{initials}</Text>
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
    backgroundColor: isDark ? 'rgba(0, 245, 255, 0.08)' : 'rgba(0, 163, 172, 0.08)',
  },
  initialsText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
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
