import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

// Solo los campos que dibuja la card: así acepta tanto el PlayerCard de
// /player-cards/ (perfil propio) como el del /players/{id}/profile/ (detalle).
export interface UltimateCardData {
  overall?: number | null;
  position?: string | null;
  pace?: number | null;
  shooting?: number | null;
  passing?: number | null;
  dribbling?: number | null;
  defense?: number | null;
  physical?: number | null;
  generated_image?: string | null;
  rarity?: string | null;
}

// La rareza se muestra como acento (borde + etiqueta) sobre el diseño base,
// así la card se ve igual en todos lados y en ambos temas. `ink` es el color
// de texto legible sobre el color de la etiqueta.
const RARITY_STYLES: Record<string, { color: string; ink: string }> = {
  bronze: { color: "#CD7F32", ink: "#1F1206" },
  silver: { color: "#A8B4C0", ink: "#0F1720" },
  gold: { color: "#F5B301", ink: "#1F1600" },
  elite: { color: "#A855F7", ink: "#FFFFFF" },
  iconic: { color: "#F43F5E", ink: "#FFFFFF" },
};

/**
 * Player card oficial de Trofi. Se usa tanto en el perfil propio como en el
 * detalle de otro jugador, para que la card se vea igual en todos lados.
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
  const rarity = card?.rarity ? RARITY_STYLES[card.rarity] : undefined;
  const accent = rarity?.color ?? theme.primary;
  return (
    <View style={[styles.cardShield, { borderColor: accent, shadowColor: accent }]}>
      <LinearGradient
        colors={isDark ? ["#1A2B48", "#0A1525"] : ["#F8FAFC", "#E2E8F0"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Brush Stroke Effect */}
      <LinearGradient
        colors={["transparent", theme.primary + "22", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {isProvisional && (
        <View style={styles.provisionalBadge}>
          <Text style={styles.provisionalText}>PROVISIONAL</Text>
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
          {rarity && card?.rarity && (
            <View style={[styles.rarityPill, { backgroundColor: rarity.color }]}>
              <Text
                style={[styles.rarityText, { color: rarity.ink }]}
                numberOfLines={1}
              >
                {t(`players.rarity_${card.rarity}`)}
              </Text>
            </View>
          )}
        </View>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.cardPlayerImage}
          />
        ) : (
          <View style={[styles.cardPlayerImage, styles.cardPlaceholderImage]}>
            <User size={64} color={theme.primary} opacity={0.6} />
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
        <View style={styles.nameDivider} />
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
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    cardShield: {
      width: 200,
      height: 300,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: theme.primary,
      overflow: "hidden",
      backgroundColor: theme.surface,
      elevation: 20,
      shadowColor: theme.primary,
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
    // Sin ancho fijo: "82" en SF (iOS) es más ancho que en Roboto y con 40pt
    // se partía en dos líneas. minWidth mantiene alineado un rating de 1 dígito.
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
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 5,
    },
    rarityText: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    // Solo `flex: 1` (sin width 100%): el 100% hacía que la foto ocupara todo
    // el ancho de la card y, como iOS no recorta, tapaba el rating y el nombre.
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
      paddingVertical: 5,
      paddingHorizontal: 12,
    },
    cardNameText: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
      letterSpacing: 1,
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
      paddingTop: 10,
      paddingHorizontal: 15,
    },
    statsColumn: {
      width: 60,
    },
    statLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    statValue: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
    },
    statKey: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.textSecondary,
    },
    statsDivider: {
      width: 1,
      height: 45,
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
  });
