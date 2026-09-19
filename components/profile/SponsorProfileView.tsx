import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { SponsorProfile, Membership } from '@/features/auth/types/auth';
import { router } from 'expo-router';
import {
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Megaphone,
  Building2,
  Calendar,
  Globe,
  Mail,
  Phone,
} from 'lucide-react-native';

interface SponsorProfileViewProps {
  sponsor: SponsorProfile;
  userEmail?: string;
  userPhone?: string;
  memberships?: Membership[];
}

export function SponsorProfileView({
  sponsor,
  userEmail,
  userPhone,
  memberships = [],
}: SponsorProfileViewProps) {
  const { theme, isDark } = useTheme();

  const handleOpenWebsite = () => {
    if (!sponsor.website) return;
    const url = sponsor.website.startsWith('http')
      ? sponsor.website
      : `https://${sponsor.website}`;
    Linking.openURL(url).catch((err) =>
      console.warn('Could not open sponsor website', err)
    );
  };

  const getCompanyInitials = () => {
    if (!sponsor.company_name) return 'SP';
    const words = sponsor.company_name.trim().split(' ');
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Corporate Hero Card */}
      <View
        style={[
          styles.corporateCard,
          {
            backgroundColor: theme.surface,
            borderColor: isDark
              ? 'rgba(139, 92, 246, 0.25)'
              : 'rgba(139, 92, 246, 0.2)',
          },
        ]}
      >
        <View style={styles.logoRow}>
          {sponsor.logo ? (
            <Image
              source={{ uri: sponsor.logo }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[
                styles.logoPlaceholder,
                { backgroundColor: '#8B5CF61A', borderColor: '#8B5CF640' },
              ]}
            >
              <Text style={styles.logoInitials}>{getCompanyInitials()}</Text>
            </View>
          )}

          <View style={styles.corporateDetails}>
            <View style={styles.verifiedRow}>
              <ShieldCheck size={16} color="#8B5CF6" />
              <Text style={styles.verifiedText}>PATROCINADOR OFICIAL</Text>
            </View>
            <Text style={[styles.companyName, { color: theme.text }]}>
              {sponsor.company_name}
            </Text>
            {sponsor.website && (
              <TouchableOpacity
                onPress={handleOpenWebsite}
                activeOpacity={0.7}
                style={styles.websiteBtn}
              >
                <Globe size={13} color="#8B5CF6" />
                <Text style={styles.websiteText} numberOfLines={1}>
                  {sponsor.website.replace(/^https?:\/\//, '')}
                </Text>
                <ExternalLink size={12} color="#8B5CF6" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Corporate Quick Stats */}
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
              {memberships.length > 0 ? memberships.length : '1'}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              LIGAS ALIADAS
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
            <Text style={[styles.kpiValue, { color: '#10B981' }]}>ACTIVO</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              ESTADO DE CUENTA
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
            <Text style={[styles.kpiValue, { color: '#8B5CF6' }]}>TROFI</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              PARTNER
            </Text>
          </View>
        </View>
      </View>

      {/* Direct CTA: Manage Placements */}
      <TouchableOpacity
        style={styles.ctaBanner}
        activeOpacity={0.8}
        onPress={() => router.push('/sponsor-placements' as any)}
      >
        <View style={styles.ctaIconBox}>
          <Megaphone size={22} color="#FFFFFF" />
        </View>
        <View style={styles.ctaTextBox}>
          <Text style={styles.ctaTitle}>Espacios Publicitarios</Text>
          <Text style={styles.ctaSubtitle}>
            Configura y administra tus anuncios en torneos y partidos
          </Text>
        </View>
      </TouchableOpacity>

      {/* Company Contact Details */}
      <View
        style={[
          styles.infoSection,
          {
            backgroundColor: theme.surface,
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          INFORMACIÓN DE CONTACTO CORPORATIVO
        </Text>

        {userEmail && (
          <View style={styles.contactRow}>
            <Mail size={16} color={theme.textSecondary} />
            <Text style={[styles.contactText, { color: theme.text }]}>
              {userEmail}
            </Text>
          </View>
        )}

        {userPhone && (
          <View style={styles.contactRow}>
            <Phone size={16} color={theme.textSecondary} />
            <Text style={[styles.contactText, { color: theme.text }]}>
              {userPhone}
            </Text>
          </View>
        )}

        {sponsor.created_at && (
          <View style={styles.contactRow}>
            <Calendar size={16} color={theme.textSecondary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>
              Patrocinador desde {new Date(sponsor.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Text>
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
  corporateCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitials: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8B5CF6',
  },
  corporateDetails: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 0.8,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  websiteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  websiteText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
    textDecorationLine: 'underline',
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
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
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
  infoSection: {
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
