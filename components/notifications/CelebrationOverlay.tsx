import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Award, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { moderateScale, scale, verticalScale } from '@/constants/layout';
import { getBadgeDefinition } from '@/components/achievements/badgeCatalog';
import { ConfettiBurst } from '@/components/notifications/ConfettiBurst';
import { useCelebrationStore } from '@/features/notifications/store/celebrationStore';
import {
  AchievementCelebration,
  RatingCelebration,
} from '@/features/notifications/types/celebration';

const AUTO_DISMISS_MS = 6500;

function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);
  return reduceMotion;
}

/**
 * Overlay global (montado en `app/_layout.tsx`) que anima los eventos
 * `achievement_unlocked` y `rating_changed` apenas llegan, sin importar en
 * qué pantalla esté el usuario. Muestra la cola de a un evento por vez.
 */
export function CelebrationOverlay() {
  const current = useCelebrationStore((state) => state.queue[0]);
  const dismissCurrent = useCelebrationStore((state) => state.dismissCurrent);
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const reduceMotion = useReduceMotion();
  const styles = createStyles(theme, isDark);

  const [entrance] = useState(() => new Animated.Value(0));
  const currentKey = current?.key;

  useEffect(() => {
    if (!currentKey) return;
    entrance.setValue(reduceMotion ? 1 : 0);
    if (!reduceMotion) {
      Animated.spring(entrance, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }).start();
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    const timer = setTimeout(dismissCurrent, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [currentKey, reduceMotion, dismissCurrent, entrance]);

  if (!current) return null;

  const badge =
    current.kind === 'achievement' ? getBadgeDefinition(current.achievementType) : undefined;
  const isCelebratory = current.kind === 'achievement' || current.direction === 'up';
  const confettiColors = [
    theme.primary,
    theme.accent,
    theme.success,
    theme.warning,
    badge?.color ?? theme.primary,
  ];

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissCurrent}
    >
      <View style={styles.backdrop}>
        {/* Tocar el fondo cierra; es hermano (no padre) de la tarjeta para no
            convertir todo el contenido en un único botón para lectores de pantalla. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissCurrent}
          accessibilityRole="button"
          accessibilityLabel={t('celebrations.close_a11y')}
        />

        {isCelebratory && !reduceMotion && (
          <ConfettiBurst key={current.key} colors={confettiColors} />
        )}

        <Animated.View
          style={[
            styles.card,
            {
              opacity: entrance,
              transform: [
                {
                  scale: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.cardInner}>
            {current.kind === 'achievement' ? (
              <AchievementContent
                key={current.key}
                event={current}
                reduceMotion={reduceMotion}
                onDismiss={dismissCurrent}
              />
            ) : (
              <RatingContent
                key={current.key}
                event={current}
                reduceMotion={reduceMotion}
                onDismiss={dismissCurrent}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface ContentProps<T> {
  event: T;
  reduceMotion: boolean;
  onDismiss: () => void;
}

function AchievementContent({ event, reduceMotion, onDismiss }: ContentProps<AchievementCelebration>) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const badge = getBadgeDefinition(event.achievementType);
  const Icon = badge?.icon ?? Award;
  const color = badge?.color ?? theme.primary;
  const title = badge?.title ?? t('celebrations.achievement_fallback_title');
  const description = badge?.description ?? event.body;

  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `${t('celebrations.achievement_overline')}. ${title}`
    );
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion, t, title]);

  const openAchievements = () => {
    onDismiss();
    router.push({ pathname: '/profile', params: { openAchievements: '1' } });
  };

  return (
    <>
      <View style={styles.badgeStage}>
        {!reduceMotion && (
          <Animated.View
            style={[
              styles.badgeHalo,
              {
                backgroundColor: color,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
                transform: [
                  { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) },
                ],
              },
            ]}
          />
        )}
        <View style={[styles.badgeCircle, { backgroundColor: color + '22', borderColor: color }]}>
          <Icon size={scale(44)} color={color} />
        </View>
      </View>

      <Text style={[styles.overline, { color }]}>{t('celebrations.achievement_overline')}</Text>
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.body}>{description}</Text>}

      <Actions
        primaryLabel={event.source === 'received' ? t('celebrations.view_achievements') : undefined}
        onPrimary={openAchievements}
        secondaryLabel={t('celebrations.dismiss')}
        onSecondary={onDismiss}
        accentColor={color}
      />
    </>
  );
}

function RatingContent({ event, reduceMotion, onDismiss }: ContentProps<RatingCelebration>) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const isUp = event.direction === 'up';
  // "down" es un aviso sobrio: color de advertencia, sin confetti.
  const color = isUp ? theme.success : theme.warning;
  const delta = event.overall - event.previousOverall;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  const [flip] = useState(() => new Animated.Value(0));
  const [flipped, setFlipped] = useState(false);
  const showNew = flipped || reduceMotion;

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      t('celebrations.rating_body', { overall: event.overall, previous: event.previousOverall })
    );
    if (reduceMotion) return;
    // Flip de la card: muestra el overall anterior, gira y revela el nuevo.
    const firstHalf = Animated.sequence([
      Animated.delay(450),
      Animated.timing(flip, {
        toValue: 0.5,
        duration: 260,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    firstHalf.start(({ finished }) => {
      if (!finished) return;
      setFlipped(true);
      Animated.timing(flip, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.back(1.6)),
        useNativeDriver: true,
      }).start();
    });
    return () => flip.stopAnimation();
    // Solo al montar: si llega un recálculo de la misma card, se actualiza el número sin re-girar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCard = () => {
    onDismiss();
    if (event.playerId) {
      router.push({ pathname: '/player-detail', params: { playerId: event.playerId } });
    }
  };

  return (
    <>
      <Animated.View
        style={[
          styles.miniCard,
          { borderColor: color },
          {
            transform: [
              { perspective: 800 },
              {
                rotateY: flip.interpolate({
                  inputRange: [0, 0.5, 0.5001, 1],
                  outputRange: ['0deg', '90deg', '-90deg', '0deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.ovrValue}>{showNew ? event.overall : event.previousOverall}</Text>
        <Text style={styles.ovrLabel}>OVR</Text>
        {showNew && (
          <View style={[styles.deltaPill, { backgroundColor: color + '22' }]}>
            <TrendIcon size={scale(14)} color={color} />
            <Text style={[styles.deltaText, { color }]}>
              {delta > 0 ? `+${delta}` : `${delta}`}
            </Text>
          </View>
        )}
      </Animated.View>

      <Text style={[styles.overline, { color }]}>
        {isUp ? t('celebrations.rating_up_overline') : t('celebrations.rating_down_overline')}
      </Text>
      <Text style={styles.body}>
        {t('celebrations.rating_body', { overall: event.overall, previous: event.previousOverall })}
      </Text>

      <Actions
        primaryLabel={
          event.source === 'received' && event.playerId ? t('celebrations.view_card') : undefined
        }
        onPrimary={openCard}
        secondaryLabel={isUp ? t('celebrations.dismiss') : t('celebrations.dismiss_neutral')}
        onSecondary={onDismiss}
        accentColor={color}
      />
    </>
  );
}

function Actions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  accentColor,
}: {
  primaryLabel?: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  accentColor: string;
}) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  return (
    <View style={styles.actions}>
      {primaryLabel && (
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: accentColor }]}
          onPress={onPrimary}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          {/* Tinta navy (fondo en dark / texto en light) sobre el color del badge. */}
          <Text style={[styles.primaryBtnText, { color: isDark ? theme.background : theme.text }]}>{primaryLabel}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={onSecondary}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryBtnText}>{secondaryLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: scale(24),
      backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,26,44,0.55)',
    },
    card: {
      width: '100%',
      maxWidth: 380,
      borderRadius: 24,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 12,
    },
    cardInner: {
      alignItems: 'center',
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(28),
      paddingBottom: verticalScale(20),
    },
    badgeStage: {
      width: scale(112),
      height: scale(112),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: verticalScale(18),
    },
    badgeHalo: {
      position: 'absolute',
      width: scale(96),
      height: scale(96),
      borderRadius: scale(48),
    },
    badgeCircle: {
      width: scale(96),
      height: scale(96),
      borderRadius: scale(48),
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    miniCard: {
      width: scale(120),
      height: scale(150),
      borderRadius: 18,
      borderWidth: 2,
      backgroundColor: theme.surfaceSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: verticalScale(18),
    },
    ovrValue: {
      fontSize: moderateScale(52),
      fontWeight: '900',
      color: theme.text,
      lineHeight: moderateScale(58),
    },
    ovrLabel: {
      fontSize: moderateScale(14),
      fontWeight: '800',
      letterSpacing: 2,
      color: theme.textSecondary,
    },
    deltaPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: verticalScale(8),
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 10,
    },
    deltaText: {
      fontSize: moderateScale(13),
      fontWeight: '900',
    },
    overline: {
      fontSize: moderateScale(12),
      fontWeight: '900',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: verticalScale(6),
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      marginBottom: verticalScale(8),
    },
    body: {
      fontSize: moderateScale(15),
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: moderateScale(21),
    },
    actions: {
      alignSelf: 'stretch',
      marginTop: verticalScale(22),
      gap: 8,
    },
    primaryBtn: {
      minHeight: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      fontSize: moderateScale(15),
      fontWeight: '800',
    },
    secondaryBtn: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryBtnText: {
      fontSize: moderateScale(15),
      fontWeight: '700',
      color: theme.textSecondary,
    },
  });
