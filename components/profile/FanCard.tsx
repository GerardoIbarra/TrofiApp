import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Info, X, ShieldCheck, Award, Flame, MapPin } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import {
  getContrastInk,
  DEFAULT_RARITY_COLORS,
} from "@/features/players/utils/cardUtils";
import { FanCard as FanCardType } from "@/features/fans/types/fanCard";

interface FanCardProps {
  name: string;
  card: FanCardType | null;
  photoUrl?: string | null;
  isProvisional?: boolean;
  showInfoButton?: boolean;
}

/**
 * Fan Card oficial de Trofi (Ticket 18).
 * Mide el compromiso del hincha a través de 4 sub-stats:
 * - PAS (passion): total de check-ins históricos
 * - LEA (loyalty): racha de asistencia actual
 * - VER (verification): check-ins verificados por GPS
 * - REC (recognition): logros de hincha/árbitro obtenidos
 */
export function FanCard({
  name,
  card,
  photoUrl,
  isProvisional,
  showInfoButton = true,
}: FanCardProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Rarity color provisto por el backend (o fallback de la escala compartida de 5 tiers)
  const normalizedRarity = card?.rarity ? card.rarity.toLowerCase().trim() : "";
  const accent =
    card?.rarity_color ||
    (normalizedRarity ? DEFAULT_RARITY_COLORS[normalizedRarity] : undefined) ||
    "#06B6D4"; // Cyan por defecto para aficionados

  const ink = getContrastInk(accent);

  // Label de rareza en español provisto por el backend o fallback
  const rarityLabel =
    card?.rarity_label ||
    (normalizedRarity
      ? t(`players.rarity_${normalizedRarity}`, normalizedRarity.toUpperCase())
      : "BRONCE");

  // Subtítulo del tipo de carta
  const subtitle =
    card?.card_type_display ||
    (card?.card_type === "season"
      ? "TEMPORADA"
      : card?.card_type === "special"
      ? "EDICIÓN ESPECIAL"
      : "HINCHA OFICIAL");

  // Se marca como provisional si tiene menos de 5 check-ins (passion < 5)
  const checkinsCount = card?.passion ?? 0;
  const isCardProvisional = isProvisional || (card !== null && checkinsCount < 5);

  return (
    <>
      <View
        style={[
          styles.cardShield,
          {
            borderColor: accent,
            shadowColor: accent,
          },
        ]}
      >
        {/* Card Background Gradient */}
        <LinearGradient
          colors={
            isDark
              ? ["#132438", "#081320"]
              : ["#F0FDF4", "#E0F2FE"]
          }
          style={StyleSheet.absoluteFill}
        />

        {/* Ambient Rarity Glow */}
        <LinearGradient
          colors={["transparent", accent + "20", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Provisional Indicator */}
        {isCardProvisional && (
          <View style={styles.provisionalBadge}>
            <Text style={styles.provisionalText}>PROVISIONAL</Text>
          </View>
        )}

        {/* Info Button */}
        {showInfoButton && (
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowStatsModal(true)}
            activeOpacity={0.7}
            accessibilityLabel="Información sobre las estadísticas del hincha"
          >
            <Info size={13} color={isDark ? "#94A3B8" : "#64748B"} />
          </TouchableOpacity>
        )}

        {/* Header: Rating, Role & Avatar */}
        <View style={styles.cardHeader}>
          <View style={styles.ratingInfo}>
            <Text style={styles.ratingNumber} numberOfLines={1}>
              {card?.overall ?? 60}
            </Text>
            <Text style={styles.posLabel} numberOfLines={1}>
              FAN
            </Text>
            {rarityLabel && (
              <View style={[styles.rarityPill, { backgroundColor: accent }]}>
                <Text style={[styles.rarityText, { color: ink }]} numberOfLines={1}>
                  {rarityLabel.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.cardPlayerImage} />
          ) : (
            <View style={[styles.cardPlayerImage, styles.cardPlaceholderImage]}>
              <Heart size={54} color={accent} opacity={0.7} fill={accent + "33"} />
            </View>
          )}
        </View>

        {/* Name Section */}
        <View style={styles.cardNameSection}>
          <Text
            style={styles.cardNameText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {name.toUpperCase()}
          </Text>
          {subtitle ? (
            <Text style={[styles.cardSubtitleText, { color: accent }]} numberOfLines={1}>
              {subtitle.toUpperCase()}
            </Text>
          ) : (
            <View style={styles.nameDivider} />
          )}
        </View>

        {/* Engagement Sub-stats Grid (2x2) */}
        <View style={styles.statsGrid}>
          <View style={styles.statsColumn}>
            <View style={styles.statLine}>
              <Text style={styles.statValue}>{card?.passion ?? 0}</Text>
              <Text style={styles.statKey}>PAS</Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statValue}>{card?.loyalty ?? 0}</Text>
              <Text style={styles.statKey}>LEA</Text>
            </View>
          </View>

          <View style={styles.statsDivider} />

          <View style={styles.statsColumn}>
            <View style={styles.statLine}>
              <Text style={styles.statValue}>{card?.verification ?? 0}</Text>
              <Text style={styles.statKey}>VER</Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statValue}>{card?.recognition ?? 0}</Text>
              <Text style={styles.statKey}>REC</Text>
            </View>
          </View>
        </View>

        {/* Card Type Tag */}
        {card?.card_type_display && card.card_type !== "base" && (
          <View style={styles.cardFooterTag}>
            <Text style={[styles.cardFooterTagText, { color: accent }]}>
              ★ {card.card_type_display.toUpperCase()} ★
            </Text>
          </View>
        )}
      </View>

      {/* Stats Breakdown Explainer Modal */}
      <Modal
        visible={showStatsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowStatsModal(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface, borderColor: accent },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Estadísticas de Hincha
              </Text>
              <TouchableOpacity
                onPress={() => setShowStatsModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.statExplanationRow}>
              <View style={[styles.statIconBox, { backgroundColor: "#EF444420" }]}>
                <Flame size={18} color="#EF4444" />
              </View>
              <View style={styles.statExplanationText}>
                <Text style={[styles.statExplanationTitle, { color: theme.text }]}>
                  PAS · Pasión ({card?.passion ?? 0})
                </Text>
                <Text style={[styles.statExplanationDesc, { color: theme.textSecondary }]}>
                  Total de check-ins históricos en la cancha.
                </Text>
              </View>
            </View>

            <View style={styles.statExplanationRow}>
              <View style={[styles.statIconBox, { backgroundColor: "#F59E0B20" }]}>
                <Heart size={18} color="#F59E0B" />
              </View>
              <View style={styles.statExplanationText}>
                <Text style={[styles.statExplanationTitle, { color: theme.text }]}>
                  LEA · Lealtad ({card?.loyalty ?? 0})
                </Text>
                <Text style={[styles.statExplanationDesc, { color: theme.textSecondary }]}>
                  Racha actual de partidos seguidos alentando a tu equipo.
                </Text>
              </View>
            </View>

            <View style={styles.statExplanationRow}>
              <View style={[styles.statIconBox, { backgroundColor: "#10B98120" }]}>
                <MapPin size={18} color="#10B981" />
              </View>
              <View style={styles.statExplanationText}>
                <Text style={[styles.statExplanationTitle, { color: theme.text }]}>
                  VER · Verificación ({card?.verification ?? 0})
                </Text>
                <Text style={[styles.statExplanationDesc, { color: theme.textSecondary }]}>
                  Check-ins presenciales confirmados por GPS en el estadio.
                </Text>
              </View>
            </View>

            <View style={styles.statExplanationRow}>
              <View style={[styles.statIconBox, { backgroundColor: "#8B5CF620" }]}>
                <Award size={18} color="#8B5CF6" />
              </View>
              <View style={styles.statExplanationText}>
                <Text style={[styles.statExplanationTitle, { color: theme.text }]}>
                  REC · Reconocimiento ({card?.recognition ?? 0})
                </Text>
                <Text style={[styles.statExplanationDesc, { color: theme.textSecondary }]}>
                  Cantidad de insignias y logros de aficionado desbloqueados.
                </Text>
              </View>
            </View>

            {isCardProvisional && (
              <View style={[styles.provisionalNotice, { backgroundColor: accent + "15" }]}>
                <ShieldCheck size={16} color={accent} />
                <Text style={[styles.provisionalNoticeText, { color: theme.text }]}>
                  Tu carta es provisional hasta alcanzar 5 check-ins. El overall se ajusta a 60 como base de calibración.
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    cardShield: {
      width: 200,
      height: 310,
      borderRadius: 20,
      borderWidth: 3,
      padding: 12,
      justifyContent: "space-between",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 10,
      overflow: "hidden",
      position: "relative",
    },
    provisionalBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: "#F59E0B",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      zIndex: 10,
    },
    provisionalText: {
      color: "#000000",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    infoButton: {
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 10,
      padding: 4,
      backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)",
      borderRadius: 12,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      height: 110,
      marginTop: 4,
    },
    ratingInfo: {
      alignItems: "center",
      minWidth: 44,
      paddingTop: 8,
    },
    ratingNumber: {
      fontSize: 32,
      fontWeight: "900",
      color: isDark ? "#FFFFFF" : "#0A1525",
      lineHeight: 34,
      letterSpacing: -1,
    },
    posLabel: {
      fontSize: 12,
      fontWeight: "800",
      color: isDark ? "#94A3B8" : "#475569",
      marginBottom: 4,
    },
    rarityPill: {
      paddingHorizontal: 5,
      paddingVertical: 1.5,
      borderRadius: 4,
      marginTop: 2,
      maxWidth: 62,
    },
    rarityText: {
      fontSize: 7.5,
      fontWeight: "900",
      letterSpacing: 0.4,
      textAlign: "center",
    },
    cardPlayerImage: {
      width: 105,
      height: 105,
      borderRadius: 14,
      resizeMode: "cover",
    },
    cardPlaceholderImage: {
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    },
    cardNameSection: {
      alignItems: "center",
      marginVertical: 4,
    },
    cardNameText: {
      fontSize: 14,
      fontWeight: "900",
      color: isDark ? "#FFFFFF" : "#0A1525",
      textAlign: "center",
      letterSpacing: 0.5,
    },
    cardSubtitleText: {
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1,
      marginTop: 1,
      textAlign: "center",
    },
    nameDivider: {
      width: 40,
      height: 2,
      backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
      marginTop: 4,
      borderRadius: 1,
    },
    statsGrid: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.45)",
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    },
    statsColumn: {
      flex: 1,
      gap: 4,
    },
    statsDivider: {
      width: 1,
      height: "75%",
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)",
      marginHorizontal: 8,
    },
    statLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    statValue: {
      fontSize: 14,
      fontWeight: "900",
      color: isDark ? "#FFFFFF" : "#0A1525",
    },
    statKey: {
      fontSize: 10,
      fontWeight: "700",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    cardFooterTag: {
      alignItems: "center",
      marginTop: 2,
    },
    cardFooterTagText: {
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalContent: {
      width: "100%",
      maxWidth: 340,
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 20,
      gap: 14,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: "800",
    },
    statExplanationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    statExplanationText: {
      flex: 1,
    },
    statExplanationTitle: {
      fontSize: 13,
      fontWeight: "700",
    },
    statExplanationDesc: {
      fontSize: 11,
      marginTop: 2,
      lineHeight: 15,
    },
    provisionalNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 10,
      borderRadius: 10,
      marginTop: 4,
    },
    provisionalNoticeText: {
      fontSize: 11,
      lineHeight: 15,
      flex: 1,
    },
  });
