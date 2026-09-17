import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Match } from "@/features/tournaments/types/match";
import { Clock, Pause, CheckCircle2 } from "lucide-react-native";

export type MatchPeriod =
  | "not_started"
  | "1T"
  | "halftime"
  | "2T"
  | "finished";

interface MatchPeriodTrackerProps {
  match: Match;
  isAdmin?: boolean;
  currentPeriod: MatchPeriod;
  currentMinute: number;
  onPeriodChange: (newPeriod: MatchPeriod) => void;
  onMinuteChange?: (minute: number) => void;
}

const PERIOD_STEPS: { key: MatchPeriod; label: string; defaultMinute: number }[] = [
  { key: "not_started", label: "Por iniciar", defaultMinute: 0 },
  { key: "1T", label: "1T", defaultMinute: 1 },
  { key: "halftime", label: "Descanso", defaultMinute: 45 },
  { key: "2T", label: "2T", defaultMinute: 46 },
  { key: "finished", label: "Terminado", defaultMinute: 90 },
];

export function MatchPeriodTracker({
  match,
  isAdmin = true,
  currentPeriod,
  currentMinute,
  onPeriodChange,
  onMinuteChange,
}: MatchPeriodTrackerProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  // Animated pulse for live status
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // Local clock ticking (seconds within current period)
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Pulse animation when live
    if (currentPeriod === "1T" || currentPeriod === "2T") {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [currentPeriod, pulseAnim]);

  // Clock ticker when match is in active period (1T or 2T)
  useEffect(() => {
    if (currentPeriod !== "1T" && currentPeriod !== "2T") return;

    const interval = setInterval(() => {
      setSeconds((prevSec) => {
        const nextSec = prevSec + 1;
        // Every 60 seconds, increment minute
        if (nextSec % 60 === 0 && onMinuteChange) {
          onMinuteChange(currentMinute + 1);
        }
        return nextSec;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPeriod, currentMinute, onMinuteChange]);

  const getStepIndex = (period: MatchPeriod) => {
    return PERIOD_STEPS.findIndex((s) => s.key === period);
  };

  const handleSelectStep = (targetPeriod: MatchPeriod) => {
    if (targetPeriod === currentPeriod) return;

    const targetStep = PERIOD_STEPS.find((s) => s.key === targetPeriod);
    const targetLabel = targetStep?.label || targetPeriod;

    Alert.alert(
      `Cambiar a ${targetLabel}`,
      `¿Deseas cambiar el estado del partido a "${targetLabel}"? El cronómetro y eventos se sincronizarán con este período.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: targetPeriod === "finished" ? "destructive" : "default",
          onPress: () => {
            onPeriodChange(targetPeriod);
            if (targetStep && onMinuteChange) {
              onMinuteChange(targetStep.defaultMinute);
            }
            setSeconds(0);
          },
        },
      ]
    );
  };

  const formatSeconds = (totalSec: number) => {
    const s = totalSec % 60;
    return s.toString().padStart(2, "0");
  };

  const isLive = currentPeriod === "1T" || currentPeriod === "2T";

  return (
    <View style={styles.container}>
      {/* Live Badge & Timer Banner */}
      <View style={styles.timerBannerRow}>
        {isLive ? (
          <View style={styles.livePill}>
            <Animated.View
              style={[
                styles.liveDot,
                { opacity: pulseAnim, transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={styles.livePillText}>EN VIVO</Text>
            <View style={styles.pillDivider} />
            <Text style={styles.periodPillText}>{currentPeriod}</Text>
            <Text style={styles.timerClockText}>
              {currentMinute}&apos;:{formatSeconds(seconds)}
            </Text>
          </View>
        ) : currentPeriod === "halftime" ? (
          <View style={[styles.livePill, styles.halftimePill]}>
            <Pause size={13} color="#FF9800" />
            <Text style={[styles.livePillText, { color: "#FF9800" }]}>
              DESCANSO (MEDIO TIEMPO)
            </Text>
            <View style={styles.pillDivider} />
            <Text style={[styles.timerClockText, { color: "#FF9800" }]}>
              45&apos;
            </Text>
          </View>
        ) : currentPeriod === "finished" ? (
          <View style={[styles.livePill, styles.finishedPill]}>
            <CheckCircle2 size={13} color="#4ADE80" />
            <Text style={[styles.livePillText, { color: "#4ADE80" }]}>
              FINALIZADO
            </Text>
            <View style={styles.pillDivider} />
            <Text style={[styles.timerClockText, { color: "#4ADE80" }]}>
              FT
            </Text>
          </View>
        ) : (
          <View style={[styles.livePill, styles.scheduledPill]}>
            <Clock size={13} color={theme.primary} />
            <Text style={[styles.livePillText, { color: theme.primary }]}>
              POR INICIAR
            </Text>
            <View style={styles.pillDivider} />
            <Text style={[styles.timerClockText, { color: theme.textSecondary }]}>
              {new Date(match.start_datetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        )}
      </View>

      {/* State Selector: Por iniciar ➔ 1T ➔ Descanso ➔ 2T ➔ Terminado */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperHeader}>
          <Text style={styles.stepperTitle}>
            {isAdmin
              ? "CONTROL DEL ÁRBITRO • PROGRESIÓN"
              : "ESTADO DEL ENCUENTRO"}
          </Text>
          {isAdmin && (
            <Text style={styles.stepperHint}>Toca para avanzar período</Text>
          )}
        </View>

        <View style={styles.stepsRow}>
          {PERIOD_STEPS.map((step, idx) => {
            const isActive = currentPeriod === step.key;
            const isPast = getStepIndex(currentPeriod) > idx;

            return (
              <React.Fragment key={step.key}>
                <TouchableOpacity
                  style={[
                    styles.stepChip,
                    isActive && styles.stepChipActive,
                    isPast && styles.stepChipPast,
                  ]}
                  onPress={() => isAdmin && handleSelectStep(step.key)}
                  disabled={!isAdmin}
                  activeOpacity={0.7}
                >
                  {isActive && isLive && (
                    <Animated.View
                      style={[styles.stepDot, { opacity: pulseAnim }]}
                    />
                  )}
                  <Text
                    style={[
                      styles.stepText,
                      isActive && styles.stepTextActive,
                      isPast && styles.stepTextPast,
                    ]}
                    numberOfLines={1}
                  >
                    {step.label}
                  </Text>
                </TouchableOpacity>

                {idx < PERIOD_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.connector,
                      isPast && styles.connectorActive,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    timerBannerRow: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    livePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(255, 68, 68, 0.15)",
      borderColor: "#FF4444",
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
    },
    halftimePill: {
      backgroundColor: "rgba(255, 152, 0, 0.15)",
      borderColor: "#FF9800",
    },
    finishedPill: {
      backgroundColor: "rgba(74, 222, 128, 0.15)",
      borderColor: "#4ADE80",
    },
    scheduledPill: {
      backgroundColor: theme.primary + "15",
      borderColor: theme.primary + "40",
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#FF4444",
    },
    livePillText: {
      fontSize: 11,
      fontWeight: "900",
      color: "#FF4444",
      letterSpacing: 1,
    },
    periodPillText: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.text,
    },
    timerClockText: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.text,
      letterSpacing: 0.5,
    },
    pillDivider: {
      width: 1,
      height: 12,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.2)"
        : "rgba(0,0,0,0.2)",
      marginHorizontal: 2,
    },
    stepperContainer: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.03)"
        : "rgba(0, 0, 0, 0.02)",
      borderRadius: 16,
      padding: 10,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(0, 0, 0, 0.05)",
    },
    stepperHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    stepperTitle: {
      fontSize: 10,
      fontWeight: "900",
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    stepperHint: {
      fontSize: 9,
      fontWeight: "700",
      color: theme.primary,
    },
    stepsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    stepChip: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 7,
      paddingHorizontal: 4,
      borderRadius: 8,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(0, 0, 0, 0.04)",
      borderWidth: 1,
      borderColor: "transparent",
      gap: 4,
    },
    stepChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    stepChipPast: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.06)",
    },
    stepDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: "#001A2C",
    },
    stepText: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.textSecondary,
      textAlign: "center",
    },
    stepTextActive: {
      color: "#001A2C",
      fontWeight: "900",
    },
    stepTextPast: {
      color: theme.text,
      fontWeight: "700",
    },
    connector: {
      width: 6,
      height: 2,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)",
      marginHorizontal: 1,
    },
    connectorActive: {
      backgroundColor: theme.primary,
    },
  });
