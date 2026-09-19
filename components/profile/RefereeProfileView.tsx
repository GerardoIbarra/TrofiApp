import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { RefereeProfile, Membership } from '@/features/auth/types/auth';
import { router } from 'expo-router';
import {
  ShieldCheck,
  Star,
  Clock,
  Award,
  ShieldAlert,
  ChevronRight,
  Whistle,
  FileBadge,
} from 'lucide-react-native';

interface RefereeProfileViewProps {
  referee: RefereeProfile;
  fullName: string;
  memberships?: Membership[];
}

export function RefereeProfileView({
  referee,
  fullName,
  memberships = [],
}: RefereeProfileViewProps) {
  const { theme, isDark } = useTheme();

  const formattedRating = referee.average_rating
    ? referee.average_rating.toFixed(1)
    : '5.0';

  return (
    <View style={styles.container}>
      {/* Credential Hero Card */}
      <View
        style={[
          styles.credentialCard,
          {
            backgroundColor: theme.surface,
            borderColor: isDark
              ? 'rgba(245, 158, 11, 0.25)'
              : 'rgba(245, 158, 11, 0.2)',
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: '#F59E0B20', borderColor: '#F59E0B50' },
            ]}
          >
            <Award size={28} color="#F59E0B" />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.statusRow}>
              {referee.admin_verified ? (
                <View style={styles.verifiedPill}>
                  <ShieldCheck size={13} color="#10B981" />
                  <Text style={styles.verifiedText}>VERIFICADO POR TROFI</Text>
                </View>
              ) : (
                <View style={styles.pendingPill}>
                  <Clock size={13} color="#F59E0B" />
                  <Text style={styles.pendingText}>EN REVISIÓN</Text>
                </View>
              )}
            </View>

            <Text style={[styles.nameText, { color: theme.text }]}>
              {fullName}
            </Text>
            <Text style={[styles.licenseText, { color: theme.textSecondary }]}>
              Licencia: #{referee.certification_number || 'PENDIENTE'}
            </Text>
          </View>
        </View>

        {/* Referee KPIs */}
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
            <View style={styles.ratingBox}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={[styles.kpiValue, { color: theme.text }]}>
                {formattedRating}
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              {referee.rating_count} VALORACIONES
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
              {referee.years_experience > 100
                ? '5+'
                : referee.years_experience || 0}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              AÑOS DE EXP.
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
            <Text
              style={[
                styles.kpiValue,
                { color: referee.admin_verified ? '#10B981' : '#F59E0B' },
              ]}
            >
              {referee.admin_verified ? 'OFICIAL' : 'REGISTRADO'}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              NIVEL
            </Text>
          </View>
        </View>
      </View>

      {/* CTA: Referee Marketplace */}
      <TouchableOpacity
        style={styles.ctaBanner}
        activeOpacity={0.8}
        onPress={() => router.push('/referee-marketplace' as any)}
      >
        <View style={styles.ctaIconBox}>
          <FileBadge size={22} color="#FFFFFF" />
        </View>
        <View style={styles.ctaTextBox}>
          <Text style={styles.ctaTitle}>Mercado de Árbitros</Text>
          <Text style={styles.ctaSubtitle}>
            Explora partidos disponibles y convocatorias de arbitraje
          </Text>
        </View>
        <ChevronRight size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* League Memberships */}
      {memberships.length > 0 && (
        <View
          style={[
            styles.membershipsCard,
            {
              backgroundColor: theme.surface,
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            LIGAS VINCULADAS
          </Text>
          {memberships.map((m) => (
            <View key={m.id} style={styles.memberRow}>
              <View style={styles.memberBullet} />
              <Text style={[styles.memberName, { color: theme.text }]}>
                {m.league_name}
              </Text>
              <Text style={[styles.memberRole, { color: '#F59E0B' }]}>
                {m.role.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  credentialCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  iconBox: {
    width: 60,
    height: 60,
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
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B9811A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.6,
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B1A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.6,
  },
  nameText: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  licenseText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
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
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginBottom: 16,
    minHeight: 56,
  },
  ctaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTextBox: {
    flex: 1,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  ctaSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  membershipsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  memberName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  memberRole: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
