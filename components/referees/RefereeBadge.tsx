import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star, CheckCircle2, Shield } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface RefereeBadgeProps {
  name?: string;
  averageRating?: number;
  ratingCount?: number;
  adminVerified?: boolean;
  yearsExperience?: number;
  compact?: boolean;
}

export const RefereeBadge: React.FC<RefereeBadgeProps> = ({
  name,
  averageRating,
  ratingCount,
  adminVerified,
  yearsExperience,
  compact = false,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const formattedRating =
    averageRating !== undefined && averageRating !== null
      ? Number(averageRating).toFixed(1)
      : null;

  return (
    <View style={styles.container}>
      {name && (
        <Text style={[styles.nameText, { color: theme.text }]} numberOfLines={1}>
          {name}
        </Text>
      )}

      <View style={styles.badgeRow}>
        {/* Rating chip */}
        {formattedRating && (
          <View style={styles.ratingChip}>
            <Star size={11} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{formattedRating}</Text>
            {ratingCount !== undefined && ratingCount > 0 && (
              <Text style={[styles.countText, { color: theme.textSecondary }]}>
                ({ratingCount})
              </Text>
            )}
          </View>
        )}

        {/* Experience chip */}
        {yearsExperience !== undefined && yearsExperience > 0 && !compact && (
          <View style={[styles.expChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.expText, { color: theme.textSecondary }]}>
              {yearsExperience} {yearsExperience === 1 ? 'año' : 'años'} exp.
            </Text>
          </View>
        )}

        {/* Trofi Verified seal */}
        {adminVerified && (
          <View style={styles.verifiedChip}>
            <CheckCircle2 size={12} color="#10B981" />
            <Text style={styles.verifiedText}>Certificado</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      gap: 3,
    },
    nameText: {
      fontSize: 14,
      fontWeight: '700',
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },
    ratingChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 12,
    },
    ratingText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#F59E0B',
    },
    countText: {
      fontSize: 10,
      fontWeight: '600',
    },
    expChip: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 12,
    },
    expText: {
      fontSize: 10,
      fontWeight: '600',
    },
    verifiedChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 12,
    },
    verifiedText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#10B981',
    },
  });
