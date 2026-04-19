import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Player } from '@/types/player';

interface PlayerAvatarProps {
  player: Player;
  theme: any;
  isDark: boolean;
}

export function PlayerAvatar({ player, theme, isDark }: PlayerAvatarProps) {
  const styles = createStyles(theme, isDark);
  const displayName = player.nickname || player.full_name.split(' ')[0];
  const avatarUrl = player.photo || `https://i.pravatar.cc/150?u=${player.id}`;

  return (
    <View style={styles.playerContainer}>
      <View style={styles.avatarBorder}>
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatarImage} 
        />
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
