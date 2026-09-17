import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { X, Share2, Shield, Trophy, MapPin, Calendar, Check } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Match } from '@/features/tournaments/types/match';

interface MatchEvent {
  id: string;
  event_type: string;
  minute: number;
  player_name: string;
  team_name: string;
}

interface ShareMatchModalProps {
  visible: boolean;
  onClose: () => void;
  match: Match | null;
  events?: MatchEvent[];
}

export function ShareMatchModal({
  visible,
  onClose,
  match,
  events = [],
}: ShareMatchModalProps) {
  const { theme } = useTheme();
  const cardRef = useRef<View>(null);
  const [aspectRatio, setAspectRatio] = useState<'story' | 'square'>('story');
  const [isSharing, setIsSharing] = useState(false);

  if (!match) return null;

  const homeGoals = events.filter(
    (e) => e.event_type === 'goal' && e.team_name === match.home_team_name
  );
  const awayGoals = events.filter(
    (e) => e.event_type === 'goal' && e.team_name === match.away_team_name
  );

  const homeScore = match.result ? match.result.home_score : 0;
  const awayScore = match.result ? match.result.away_score : 0;

  const formattedDate = match.start_datetime
    ? new Date(match.start_datetime).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).toUpperCase()
    : '';

  const handleShare = async () => {
    if (!cardRef.current || isSharing) return;

    try {
      setIsSharing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1.0,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Compartir Resultado',
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error sharing match card:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSharing(false);
    }
  };

  const isStory = aspectRatio === 'story';
  const cardWidth = 320;
  const cardHeight = isStory ? 540 : 360;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>COMPARTIR RESULTADO</Text>
              <Text style={styles.modalSubtitle}>Listo para historias de WhatsApp e Instagram</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Aspect Ratio Selector */}
          <View style={styles.formatSelector}>
            <TouchableOpacity
              style={[styles.formatBtn, isStory && styles.formatBtnActive]}
              onPress={() => setAspectRatio('story')}
            >
              <Text style={[styles.formatText, isStory && styles.formatTextActive]}>Historia 9:16</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formatBtn, !isStory && styles.formatBtnActive]}
              onPress={() => setAspectRatio('square')}
            >
              <Text style={[styles.formatText, !isStory && styles.formatTextActive]}>Cuadrado 1:1</Text>
            </TouchableOpacity>
          </View>

          {/* Preview ViewShot Container */}
          <ScrollView contentContainerStyle={styles.cardWrapper} showsVerticalScrollIndicator={false}>
            <View
              ref={cardRef}
              collapsable={false}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  height: cardHeight,
                },
              ]}
            >
              <LinearGradient
                colors={['#051329', '#081E3D', '#040F20']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {/* Tournament & Status Badge */}
              <View style={styles.cardTop}>
                <View style={styles.tournamentBadge}>
                  <Trophy size={12} color="#00F0FF" />
                  <Text style={styles.tournamentName} numberOfLines={1}>
                    {match.tournament_name?.toUpperCase() || 'TORNEO'}
                  </Text>
                </View>
                <View style={styles.finalTag}>
                  <Text style={styles.finalTagText}>FINAL</Text>
                </View>
              </View>

              {/* Teams & Score Row */}
              <View style={styles.scoreRow}>
                {/* Home */}
                <View style={styles.teamColumn}>
                  <View style={styles.logoCircle}>
                    {match.home_team_logo ? (
                      <Image
                        source={{ uri: match.home_team_logo.replace(/\s/g, '') }}
                        style={styles.teamLogo}
                        contentFit="contain"
                      />
                    ) : (
                      <Shield size={36} color="#00F0FF" />
                    )}
                  </View>
                  <Text style={styles.teamName} numberOfLines={2}>
                    {match.home_team_name?.toUpperCase()}
                  </Text>
                </View>

                {/* Score */}
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreText}>{homeScore}</Text>
                  <Text style={styles.scoreDash}>-</Text>
                  <Text style={styles.scoreText}>{awayScore}</Text>
                </View>

                {/* Away */}
                <View style={styles.teamColumn}>
                  <View style={styles.logoCircle}>
                    {match.away_team_logo ? (
                      <Image
                        source={{ uri: match.away_team_logo.replace(/\s/g, '') }}
                        style={styles.teamLogo}
                        contentFit="contain"
                      />
                    ) : (
                      <Shield size={36} color="#00F0FF" />
                    )}
                  </View>
                  <Text style={styles.teamName} numberOfLines={2}>
                    {match.away_team_name?.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Goal Scorers */}
              <View style={styles.goalsContainer}>
                <View style={styles.goalsColumn}>
                  {homeGoals.slice(0, isStory ? 5 : 3).map((g) => (
                    <Text key={g.id} style={styles.goalItem} numberOfLines={1}>
                      ⚽ {g.player_name} {g.minute}&apos;
                    </Text>
                  ))}
                </View>
                <View style={[styles.goalsColumn, { alignItems: 'flex-end' }]}>
                  {awayGoals.slice(0, isStory ? 5 : 3).map((g) => (
                    <Text key={g.id} style={styles.goalItem} numberOfLines={1}>
                      {g.minute}&apos; {g.player_name} ⚽
                    </Text>
                  ))}
                </View>
              </View>

              {/* Venue & Date */}
              <View style={styles.cardDetails}>
                {Boolean(match.venue_name) && (
                  <View style={styles.detailRow}>
                    <MapPin size={11} color="#94A3B8" />
                    <Text style={styles.detailText}>{match.venue_name}</Text>
                  </View>
                )}
                {Boolean(formattedDate) && (
                  <View style={styles.detailRow}>
                    <Calendar size={11} color="#94A3B8" />
                    <Text style={styles.detailText}>{formattedDate}</Text>
                  </View>
                )}
              </View>

              {/* Watermark */}
              <View style={styles.watermark}>
                <Text style={styles.watermarkText}>
                  TROFI • <Text style={{ color: '#00F0FF' }}>trofi.club</Text>
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.shareActionBtn, isSharing && { opacity: 0.7 }]}
            onPress={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator color="#001A2C" />
            ) : (
              <>
                <Share2 size={18} color="#001A2C" />
                <Text style={styles.shareActionText}>COMPARTIR EN WHATSAPP / REDES</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0A192F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  formatBtnActive: {
    backgroundColor: '#00F0FF',
  },
  formatText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  formatTextActive: {
    color: '#001A2C',
    fontWeight: '900',
  },
  cardWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tournamentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: '70%',
  },
  tournamentName: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  finalTag: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  finalTagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  teamColumn: {
    alignItems: 'center',
    width: '32%',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLogo: {
    width: 46,
    height: 46,
  },
  teamName: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 14,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34%',
    gap: 8,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '900',
  },
  scoreDash: {
    color: '#00F0FF',
    fontSize: 28,
    fontWeight: '700',
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 4,
  },
  goalsColumn: {
    width: '48%',
    gap: 4,
  },
  goalItem: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  watermark: {
    alignItems: 'center',
  },
  watermarkText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  shareActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 14,
  },
  shareActionText: {
    color: '#001A2C',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
