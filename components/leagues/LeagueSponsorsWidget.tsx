import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Award, Plus } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useGetSponsorPlacements } from '@/features/sponsors/services/sponsorApi';
import { PlacementCard } from '@/components/sponsors/PlacementCard';
import { CreatePlacementModal } from '@/components/sponsors/CreatePlacementModal';
import { SponsorBanner } from '@/components/sponsors/SponsorBanner';

interface LeagueSponsorsWidgetProps {
  leagueId: string;
}

export const LeagueSponsorsWidget: React.FC<LeagueSponsorsWidgetProps> = ({
  leagueId,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: placements, isLoading, refetch } = useGetSponsorPlacements({
    league: leagueId,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.actionHeader}>
        <View style={styles.badgeRow}>
          <Award size={16} color="#F59E0B" />
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Patrocinadores Oficiales
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.applyBtn, { backgroundColor: theme.primary }]}
          onPress={() => setIsModalOpen(true)}
        >
          <Plus size={14} color="#001A2C" />
          <Text style={styles.applyBtnText}>Pautar Aquí</Text>
        </TouchableOpacity>
      </View>

      <SponsorBanner
        placementType="standings_banner"
        leagueId={leagueId}
        style={{ marginBottom: 14 }}
      />

      {placements && placements.length > 0 ? (
        placements.map((placement) => (
          <PlacementCard
            key={placement.id}
            placement={placement}
            onRefresh={refetch}
          />
        ))
      ) : (
        <View style={[styles.emptyBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
          <Award size={36} color={theme.textSecondary} opacity={0.3} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Espacio disponible para tu marca
          </Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            Esta liga tiene habilitada la red publicitaria. Promociona tu negocio o producto ante toda la comunidad.
          </Text>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: theme.primary }]}
            onPress={() => setIsModalOpen(true)}
          >
            <Plus size={16} color="#001A2C" />
            <Text style={styles.ctaBtnText}>Pedir Espacio Publicitario</Text>
          </TouchableOpacity>
        </View>
      )}

      <CreatePlacementModal
        visible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refetch();
        }}
        preselectedLeagueId={leagueId}
      />
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingVertical: 12,
    },
    center: {
      padding: 40,
      alignItems: 'center',
    },
    actionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '800',
    },
    applyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    applyBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
    },
    emptyBox: {
      padding: 24,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      marginTop: 6,
    },
    emptyTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginTop: 10,
      marginBottom: 4,
      textAlign: 'center',
    },
    emptyDesc: {
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 16,
      marginBottom: 16,
    },
    ctaBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 10,
    },
    ctaBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
  });
