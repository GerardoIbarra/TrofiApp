import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Trophy, Flame, Sparkles } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import {
  getContrastInk,
  DEFAULT_RARITY_COLORS,
  UltimateCardData,
} from "@/features/players/utils/cardUtils";

export { getContrastInk, UltimateCardData };

/**
 * Player card oficial de Trofi.
 * El backend es la fuente de verdad de rarity_color, rarity_label y card_type_display.
 */
export function UltimateCard({
  name,
  card,
  photoUrl,
  isProvisional,
}: {
  name: string;
  card: UltimateCardData | null;
  photoUrl?: string | null;
  /** Card calculada con pocos partidos (ver stats del torneo). */
  isProvisional?: boolean;
}) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const avatarUri = photoUrl || card?.generated_image;

  // El backend es la fuente de verdad del color hex (PlayerCard.RARITY_COLORS)
  const normalizedRarity = card?.rarity ? card.rarity.toLowerCase().trim() : "";
  const accent =
    card?.rarity_color ||
    (normalizedRarity ? DEFAULT_RARITY_COLORS[normalizedRarity] : undefined) ||
    theme.primary;

  const ink = getContrastInk(accent);

  // rarity_label viene del backend en español listo para mostrar
  const rarityLabel =
    card?.rarity_label ||
    (normalizedRarity ? t(`players.rarity_${normalizedRarity}`, normalizedRarity.toUpperCase()) : null);

  // Subtítulo de torneo o tipo de carta especial
  const subtitle =
    card?.tournament_season_label ||
    card?.tournament_name ||
    (card?.card_type_display && card.card_type !== "base" ? card.card_type_display : null);

  const isLegend = normalizedRarity === "legend";
  const isChampion = normalizedRarity === "champion";
  const isOnFire = normalizedRarity === "on_fire";

  return (
    <View
      style={[
        styles.cardShield,
        {
          borderColor: accent,
          shadowColor: accent,
        },
      ]}
    >
      <LinearGradient
        colors={
          isLegend
            ? ["#18181B", "#09090B"]
            : isDark
            ? ["#1A2B48", "#0A1525"]
            : ["#F8FAFC", "#E2E8F0"]
        }
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Brush Stroke Effect */}
      <LinearGradient
        colors={["transparent", accent + "22", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {isProvisional && (
        <View style={styles.provisionalBadge}>
          <Text style={styles.provisionalText}>PROVISIONAL</Text>
        </View>
      )}

      {/* Special Edition Badge Icon */}
      {isChampion && (
        <View style={styles.specialBadge}>
          <Trophy size={11} color="#FFD700" />
        </View>
      )}
      {isOnFire && (
        <View style={styles.specialBadge}>
          <Flame size={11} color="#FF4500" />
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingNumber} numberOfLines={1}>
            {card?.overall || "--"}
          </Text>
          <Text style={styles.posLabel} numberOfLines={1}>
            {card?.position || "ST"}
          </Text>
          {rarityLabel && (
            <View style={[styles.rarityPill, { backgroundColor: accent }]}>
              <Text style={[styles.rarityText, { color: ink }]} numberOfLines={1}>
                {rarityLabel.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.cardPlayerImage} />
        ) : (
          <View style={[styles.cardPlayerImage, styles.cardPlaceholderImage]}>
            <User size={64} color={accent} opacity={0.6} />
          </View>
        )}
      </View>

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

      <View style={styles.statsGrid}>
        <View style={styles.statsColumn}>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.pace || "--"}</Text>
            <Text style={styles.statKey}>RIT</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.shooting || "--"}</Text>
            <Text style={styles.statKey}>TIR</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.passing || "--"}</Text>
            <Text style={styles.statKey}>PAS</Text>
          </View>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsColumn}>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.dribbling || "--"}</Text>
            <Text style={styles.statKey}>REG</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.defense || "--"}</Text>
            <Text style={styles.statKey}>DEF</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.physical || "--"}</Text>
            <Text style={styles.statKey}>FIS</Text>
          </View>
        </View>
      </View>

      {/* Special card type chip at the bottom */}
      {card?.card_type_display && card.card_type !== "base" && (
        <View style={styles.cardFooterTag}>
          <Text style={[styles.cardFooterTagText, { color: accent }]}>
            ★ {card.card_type_display.toUpperCase()} ★
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    cardShield: {
      width: 200,
      height: 310,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: theme.primary,
      overflow: "hidden",
      backgroundColor: theme.surface,
      elevation: 20,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
    },
    cardHeader: {
      flexDirection: "row",
      height: 140,
      paddingTop: 20,
      paddingLeft: 15,
    },
    ratingInfo: {
      alignItems: "center",
      minWidth: 44,
      flexShrink: 0,
      marginRight: 6,
    },
    ratingNumber: {
      fontSize: 32,
      fontWeight: "900",
      color: theme.text,
      lineHeight: 34,
    },
    posLabel: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.textSecondary,
      marginTop: -2,
    },
    rarityPill: {
      marginTop: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 5,
    },
    rarityText: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    cardPlayerImage: {
      flex: 1,
      height: "110%",
      resizeMode: "contain",
      marginTop: -10,
    },
    cardPlaceholderImage: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
      borderRadius: 16,
      marginRight: 10,
    },
    cardNameSection: {
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    cardNameText: {
      fontSize: 17,
      fontWeight: "900",
      color: theme.text,
      letterSpacing: 1,
    },
    cardSubtitleText: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
      marginTop: 2,
    },
    nameDivider: {
      width: "80%",
      height: 1,
      backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
      marginTop: 4,
    },
    statsGrid: {
      flexDirection: "row",
      justifyContent: "center",
      paddingTop: 8,
      paddingHorizontal: 15,
    },
    statsColumn: {
      width: 60,
    },
    statLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 3,
    },
    statValue: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.text,
    },
    statKey: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.textSecondary,
    },
    statsDivider: {
      width: 1,
      height: 42,
      backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
      marginHorizontal: 10,
    },
    provisionalBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 1,
      backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,26,44,0.75)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    provisionalText: {
      color: "#FFFFFF",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
    },
    specialBadge: {
      position: "absolute",
      top: 10,
      left: 10,
      zIndex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 5,
      borderRadius: 12,
    },
    cardFooterTag: {
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 4,
    },
    cardFooterTagText: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 1,
    },
  });
