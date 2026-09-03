import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  Award,
  Eye,
  MousePointerClick,
  Percent,
  Calendar,
  RefreshCw,
  Trash2,
  Pause,
  Play,
  Layers,
  Trophy,
  Shield,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { SponsorPlacement } from '@/features/sponsors/types/sponsor';
import {
  useDeleteSponsorPlacement,
  useUpdateSponsorPlacement,
} from '@/features/sponsors/services/sponsorApi';
import { RenewPlacementModal } from './RenewPlacementModal';

interface PlacementCardProps {
  placement: SponsorPlacement;
  onRefresh?: () => void;
}

export const PlacementCard: React.FC<PlacementCardProps> = ({
  placement,
  onRefresh,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [renewModalVisible, setRenewModalVisible] = useState(false);

  const updateMutation = useUpdateSponsorPlacement();
  const deleteMutation = useDeleteSponsorPlacement();

  const ctr =
    placement.impressions > 0
      ? ((placement.clicks / placement.impressions) * 100).toFixed(1)
      : '0.0';

  const isExpired =
    placement.is_expired ||
    new Date(placement.ends_at).getTime() < new Date().getTime();

  const handleToggleActive = () => {
    const nextState = !placement.is_active;
    updateMutation.mutate(
      {
        id: placement.id,
        data: { is_active: nextState },
      },
      {
        onSuccess: () => {
          Alert.alert(
            nextState ? 'Espacio Activado' : 'Espacio Pausado',
            `El espacio publicitario ha sido ${nextState ? 'activado' : 'pausado'} correctamente.`
          );
          onRefresh?.();
        },
        onError: (err: any) => {
          const detail =
            err?.response?.data?.detail ||
            'No tienes permisos para modificar este espacio publicitario (403).';
          Alert.alert('Error', detail);
        },
      }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Patrocinio',
      '¿Estás seguro de que deseas eliminar este espacio publicitario? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(placement.id, {
              onSuccess: () => {
                Alert.alert('Eliminado', 'El patrocinio ha sido eliminado.');
                onRefresh?.();
              },
              onError: (err: any) => {
                const detail =
                  err?.response?.data?.detail ||
                  'No tienes permisos para eliminar este espacio publicitario (403).';
                Alert.alert('Error', detail);
              },
            });
          },
        },
      ]
    );
  };

  const getTargetInfo = () => {
    if (placement.league || placement.league_name) {
      return {
        icon: Layers,
        label: `Liga: ${placement.league_name || 'Liga'}`,
      };
    }
    if (placement.tournament || placement.tournament_name) {
      return {
        icon: Trophy,
        label: `Torneo: ${placement.tournament_name || 'Torneo'}`,
      };
    }
    if (placement.team || placement.team_name) {
      return {
        icon: Shield,
        label: `Equipo: ${placement.team_name || 'Equipo'}`,
      };
    }
    return {
      icon: Award,
      label: 'General',
    };
  };

  const targetInfo = getTargetInfo();
  const TargetIcon = targetInfo.icon;

  const getPlacementTypeLabel = () => {
    switch (placement.placement_type) {
      case 'standings_banner':
        return 'Tabla Posiciones';
      case 'match_banner':
        return 'Detalle Partido';
      case 'share_card':
        return 'Tarjeta Compartible';
      default:
        return placement.placement_type;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {/* Header Row: Target & Status */}
      <View style={styles.headerRow}>
        <View style={styles.targetBadge}>
          <TargetIcon size={12} color={theme.primary} />
          <Text style={[styles.targetText, { color: theme.text }]} numberOfLines={1}>
            {targetInfo.label}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            isExpired
              ? styles.statusExpired
              : !placement.is_active
              ? styles.statusInactive
              : styles.statusActive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isExpired
                ? styles.statusTextExpired
                : !placement.is_active
                ? styles.statusTextInactive
                : styles.statusTextActive,
            ]}
          >
            {isExpired ? 'Vencido' : !placement.is_active ? 'Pausado' : 'Activo'}
          </Text>
        </View>
      </View>

      {/* Main Title & Type */}
      <View style={styles.titleSection}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {placement.title || placement.sponsor_name || 'Espacio Publicitario'}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.typePill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.typeText, { color: theme.textSecondary }]}>
              {getPlacementTypeLabel()}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Calendar size={12} color={theme.textSecondary} />
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              Fin: {new Date(placement.ends_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Optional Banner Preview */}
      {placement.image_url && (
        <Image
          source={{ uri: placement.image_url }}
          style={styles.bannerPreview}
          resizeMode="cover"
        />
      )}

      {/* Metrics Grid: Impressions, Clicks, CTR */}
      <View style={[styles.metricsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <Eye size={14} color="#38BDF8" />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Vistas</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.text }]}>
            {placement.impressions.toLocaleString()}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <MousePointerClick size={14} color="#34D399" />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Clics</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.text }]}>
            {placement.clicks.toLocaleString()}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <Percent size={14} color="#FBBF24" />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>CTR</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.text }]}>{ctr}%</Text>
        </View>
      </View>

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.renewBtn, { backgroundColor: theme.primary }]}
          onPress={() => setRenewModalVisible(true)}
        >
          <RefreshCw size={14} color="#001A2C" />
          <Text style={styles.renewBtnText}>Renovar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionIconBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
          onPress={handleToggleActive}
          disabled={updateMutation.isPending}
        >
          {placement.is_active ? (
            <Pause size={15} color={theme.textSecondary} />
          ) : (
            <Play size={15} color="#10B981" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionIconBtn, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 size={15} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <RenewPlacementModal
        visible={renewModalVisible}
        onClose={() => {
          setRenewModalVisible(false);
          onRefresh?.();
        }}
        placement={placement}
      />
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    targetBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      maxWidth: '70%',
    },
    targetText: {
      fontSize: 12,
      fontWeight: '700',
    },
    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    statusActive: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    statusInactive: {
      backgroundColor: 'rgba(156, 163, 175, 0.15)',
    },
    statusExpired: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    statusText: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    statusTextActive: {
      color: '#10B981',
    },
    statusTextInactive: {
      color: '#9CA3AF',
    },
    statusTextExpired: {
      color: '#EF4444',
    },
    titleSection: {
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 4,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    typePill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    typeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dateText: {
      fontSize: 11,
      fontWeight: '500',
    },
    bannerPreview: {
      width: '100%',
      height: 70,
      borderRadius: 10,
      marginBottom: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    },
    metricsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 14,
    },
    metricBox: {
      flex: 1,
      alignItems: 'center',
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: '600',
    },
    metricValue: {
      fontSize: 15,
      fontWeight: '900',
    },
    metricDivider: {
      width: 1,
      height: 24,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    renewBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 38,
      borderRadius: 10,
    },
    renewBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
    actionIconBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
