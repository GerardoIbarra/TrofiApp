import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MapPin,
  Users,
  Flame,
  CheckCircle2,
  Star,
  Zap,
  Camera,
  MessageSquare,
  Clock,
  Send,
  Flag,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  X,
  ChevronLeft,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import {
  useGetPickupSpot,
  useGetPickupComments,
  useCreatePickupComment,
  useRatePickupSpot,
  useUploadPickupPhoto,
  useReportPickupSpot,
  useCreatePickupPlan,
  useVerifyPickupSpot,
  useUnverifyPickupSpot,
} from '@/features/pickup/services/pickupApi';
import { PickupCheckInModal } from '@/components/pickup/PickupCheckInModal';
import { CreatePickupAlertModal } from '@/components/pickup/CreatePickupAlertModal';

export default function PickupSpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const [isCheckInModalVisible, setIsCheckInModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState<'does_not_exist' | 'unsafe' | 'inappropriate' | 'other'>('unsafe');
  const [reportNote, setReportNote] = useState('');
  const [commentText, setCommentText] = useState('');
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  const [myRating, setMyRating] = useState<number | null>(null);

  const { data: spot, isLoading, refetch } = useGetPickupSpot(id);
  const { data: comments = [], refetch: refetchComments } = useGetPickupComments(id);

  const commentMutation = useCreatePickupComment();
  const rateMutation = useRatePickupSpot();
  const uploadPhotoMutation = useUploadPickupPhoto();
  const reportMutation = useReportPickupSpot();
  const planMutation = useCreatePickupPlan();
  const verifyMutation = useVerifyPickupSpot();
  const unverifyMutation = useUnverifyPickupSpot();

  const handleRate = async (stars: number) => {
    if (!id) return;
    setMyRating(stars);
    try {
      await rateMutation.mutateAsync({ spot: id, stars });
      Alert.alert('¡Gracias!', `Has calificado esta cancha con ${stars} estrella${stars > 1 ? 's' : ''}.`);
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo guardar la calificación.');
    }
  };

  const handleAddComment = async () => {
    if (!id || !commentText.trim()) return;
    try {
      await commentMutation.mutateAsync({ spot: id, body: commentText.trim() });
      setCommentText('');
      refetchComments();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo publicar el comentario.');
    }
  };

  const handleUploadPhoto = async () => {
    if (!id) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Se requiere acceso a la galería.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const b64 = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        await uploadPhotoMutation.mutateAsync({
          spot: id,
          photo: b64,
          caption: 'Foto de la cancha',
        });
        Alert.alert('Foto subida', 'La foto se ha agregado a la galería del lugar.');
        refetch();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo subir la foto.');
    }
  };

  const handleCreatePlan = () => {
    if (!id) return;
    Alert.alert(
      'Planeo ir',
      '¿Deseas marcar que planeas ir a jugar hoy más tarde?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, voy a ir',
          onPress: async () => {
            try {
              const futureDate = new Date(Date.now() + 3 * 3600 * 1000).toISOString();
              await planMutation.mutateAsync({
                spot: id,
                planned_for: futureDate,
                note: 'Planeo jugar hoy',
              });
              Alert.alert('Plan registrado', 'Se sumó tu intención de ir a la cancha.');
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo registrar el plan.');
            }
          },
        },
      ]
    );
  };

  const handleSendReport = async () => {
    if (!id) return;
    try {
      await reportMutation.mutateAsync({
        spot: id,
        reason: reportReason,
        note: reportNote.trim() || undefined,
      });
      Alert.alert('Reporte enviado', 'El equipo de moderación revisará el lugar.');
      setIsReportModalVisible(false);
      setReportNote('');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo enviar el reporte.');
    }
  };

  if (isLoading || !spot) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackgroundGradient />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const activeCheckins = spot.active_checkins || [];
  const photos = spot.photos || [];

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle} numberOfLines={1}>
          {spot.name}
        </Text>
        <TouchableOpacity style={styles.reportBtn} onPress={() => setIsReportModalVisible(true)}>
          <Flag size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{spot.spot_type.toUpperCase()}</Text>
            </View>
            {spot.is_trending && (
              <View style={styles.trendingBadge}>
                <Flame size={12} color="#EF4444" />
                <Text style={styles.trendingText}>Trending Ahora</Text>
              </View>
            )}
            {spot.is_verified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={12} color="#4ADE80" />
                <Text style={styles.verifiedText}>Verificada</Text>
              </View>
            )}
          </View>

          <Text style={styles.spotTitle}>{spot.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={theme.textSecondary} />
            <Text style={styles.locationText}>
              {spot.address || spot.city || 'Sin dirección registrada'}
              {spot.distance_km != null && ` • a ${spot.distance_km.toFixed(1)} km`}
            </Text>
          </View>

          {spot.description && <Text style={styles.descriptionText}>{spot.description}</Text>}

          {spot.verification_reason && (
            <View style={styles.verifReasonBox}>
              <ShieldCheck size={14} color="#4ADE80" />
              <Text style={styles.verifReasonText}>{spot.verification_reason}</Text>
            </View>
          )}

          {/* Busy Windows */}
          {spot.busy_windows && (
            <View style={styles.busyBox}>
              <Clock size={14} color="#F59E0B" />
              <Text style={styles.busyText}>
                Horarios más concurridos: Días{' '}
                {spot.busy_windows.weekdays.map((d) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]).join(', ')}{' '}
                de {spot.busy_windows.start_hour}:00 a {spot.busy_windows.end_hour}:00
              </Text>
            </View>
          )}
        </View>

        {/* Live Status & Action Buttons */}
        <View style={styles.liveCard}>
          <View style={styles.liveLeft}>
            <Text style={styles.liveHeading}>
              {spot.active_checkin_count > 0
                ? `⚽ ${spot.active_checkin_count} jugando ahora`
                : 'Tranquilo por ahora'}
            </Text>
            <Text style={styles.liveSub}>
              {spot.estimated_headcount > 0
                ? `Estimado en cancha: ~${spot.estimated_headcount} personas`
                : 'Sin check-ins activos recientes'}
              {spot.upcoming_plan_count ? ` • ${spot.upcoming_plan_count} van a ir` : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkInBigBtn}
            onPress={() => setIsCheckInModalVisible(true)}
            activeOpacity={0.85}
          >
            <Zap size={16} color="#001A2C" />
            <Text style={styles.checkInBigBtnText}>¡Estoy acá!</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions: Planeo ir + Avisame */}
        <View style={styles.actionPillsRow}>
          <TouchableOpacity style={styles.actionPill} onPress={handleCreatePlan}>
            <Calendar size={14} color={theme.primary} />
            <Text style={styles.actionPillText}>Planeo ir hoy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => setIsAlertModalVisible(true)}
          >
            <Clock size={14} color={theme.primary} />
            <Text style={styles.actionPillText}>Avisarme si juegan</Text>
          </TouchableOpacity>
        </View>

        {/* Who is playing right now? */}
        {activeCheckins.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>¿QUIÉN ESTÁ JUGANDO AHORA?</Text>
            {activeCheckins.map((chk, idx) => (
              <View key={idx} style={styles.checkinItem}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.chkUserName}>{chk.user_name}</Text>
                    {chk.user_tier && (
                      <View style={styles.tierPill}>
                        <Text style={styles.tierPillText}>{chk.user_tier.name}</Text>
                      </View>
                    )}
                    {chk.is_location_verified && (
                      <CheckCircle2 size={12} color="#4ADE80" />
                    )}
                  </View>
                  {chk.note && <Text style={styles.chkNote}>"{chk.note}"</Text>}
                  {chk.additional_headcount ? (
                    <Text style={styles.chkHeadcount}>+ {chk.additional_headcount} personas con él</Text>
                  ) : null}
                </View>
                <Text style={styles.chkTime}>
                  {new Date(chk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Star Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>CALIFICACIÓN</Text>

          {/* Community Average */}
          <View style={styles.ratingSummaryRow}>
            <View style={styles.ratingScoreContainer}>
              <Text style={styles.ratingScoreBig}>
                {spot.average_rating > 0 ? spot.average_rating.toFixed(1) : '-'}
              </Text>
              <Text style={styles.ratingScaleText}>/ 5</Text>
            </View>

            <View style={styles.ratingMetaCol}>
              <View style={styles.starsStaticRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={`avg-${s}`}
                    size={16}
                    color="#F59E0B"
                    fill={s <= Math.round(spot.average_rating) ? '#F59E0B' : 'transparent'}
                  />
                ))}
              </View>
              <Text style={styles.ratingCountSub}>
                {spot.average_rating > 0
                  ? `Promedio de la comunidad (${spot.rating_count ?? 1} reseña${(spot.rating_count ?? 1) > 1 ? 's' : ''})`
                  : 'Aún no hay calificaciones de la comunidad'}
              </Text>
            </View>
          </View>

          {/* User Interactive Rating */}
          <View style={styles.userRateDivider} />
          <View style={styles.userRateSection}>
            <Text style={styles.userRatePrompt}>
              {myRating != null
                ? `Tu calificación guardada: ${myRating} / 5`
                : '¿Conoces esta cancha? Toca para calificar:'}
            </Text>
            <View style={styles.starsInteractiveRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={`user-star-${star}`}
                  onPress={() => handleRate(star)}
                  style={styles.starTouchArea}
                  activeOpacity={0.7}
                >
                  <Star
                    size={28}
                    color="#F59E0B"
                    fill={myRating != null && star <= myRating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>FOTOS DE LA CANCHA ({photos.length})</Text>
            <TouchableOpacity style={styles.addPhotoBtn} onPress={handleUploadPhoto}>
              <Camera size={14} color={theme.primary} />
              <Text style={styles.addPhotoText}>Subir Foto</Text>
            </TouchableOpacity>
          </View>

          {photos.length === 0 ? (
            <Text style={styles.emptySmallText}>Aún no hay fotos. Sé el primero en compartir una.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
              {photos.map((p) => (
                <TouchableOpacity key={p.id} onPress={() => setPreviewImageUri(p.photo)}>
                  <Image source={{ uri: p.photo }} style={styles.photoThumb} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>COMENTARIOS Y RESEÑAS ({comments.length})</Text>

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Deja un comentario sobre la cancha..."
              placeholderTextColor={theme.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={[styles.sendCommentBtn, !commentText.trim() && styles.btnDisabled]}
              onPress={handleAddComment}
              disabled={!commentText.trim() || commentMutation.isPending}
            >
              <Send size={16} color="#001A2C" />
            </TouchableOpacity>
          </View>

          {comments.map((cm: any) => {
            const displayName =
              cm.user_name ||
              cm.username ||
              cm.user?.username ||
              (cm.user?.first_name
                ? `${cm.user.first_name} ${cm.user.last_name || ''}`.trim()
                : null) ||
              (cm.author?.username ? cm.author.username : null) ||
              'Jugador';
            const initial = displayName.charAt(0).toUpperCase() || 'J';

            return (
              <View key={cm.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentUserRow}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>{initial}</Text>
                    </View>
                    <Text style={styles.commentUser}>{displayName}</Text>
                  </View>
                  <Text style={styles.commentDate}>
                    {new Date(cm.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.commentBody}>{cm.body}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Modals */}
      <PickupCheckInModal
        visible={isCheckInModalVisible}
        onClose={() => setIsCheckInModalVisible(false)}
        spotId={spot.id}
        spotName={spot.name}
        onSuccess={() => refetch()}
      />

      <CreatePickupAlertModal
        visible={isAlertModalVisible}
        onClose={() => setIsAlertModalVisible(false)}
        initialSpotId={spot.id}
        initialSpotName={spot.name}
      />

      {/* Report Modal */}
      <Modal visible={isReportModalVisible} transparent animationType="fade" onRequestClose={() => setIsReportModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.reportModalCard}>
            <Text style={styles.reportModalTitle}>Reportar Cancha</Text>
            <Text style={styles.reportModalSub}>
              El reporte es privado y será evaluado manualmente por el equipo de Trofi.
            </Text>

            <View style={styles.reasonsRow}>
              {[
                { key: 'unsafe', label: 'Inseguro' },
                { key: 'does_not_exist', label: 'No existe' },
                { key: 'inappropriate', label: 'Inapropiado' },
                { key: 'other', label: 'Otro' },
              ].map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.reasonPill, reportReason === r.key && styles.reasonPillActive]}
                  onPress={() => setReportReason(r.key as any)}
                >
                  <Text style={[styles.reasonPillText, reportReason === r.key && styles.reasonPillTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reportInput}
              placeholder="Detalles adicionales del reporte..."
              placeholderTextColor={theme.textSecondary}
              value={reportNote}
              onChangeText={setReportNote}
              multiline
            />

            <View style={styles.reportActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsReportModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmReportBtn} onPress={handleSendReport}>
                <Text style={styles.confirmReportText}>Enviar Reporte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Photo Modal */}
      <Modal visible={Boolean(previewImageUri)} transparent onRequestClose={() => setPreviewImageUri(null)}>
        <View style={styles.fullBackdrop}>
          <TouchableOpacity style={styles.closeFullBtn} onPress={() => setPreviewImageUri(null)}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          {previewImageUri && <Image source={{ uri: previewImageUri }} style={styles.fullImg} resizeMode="contain" />}
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    backBtn: {
      padding: 4,
    },
    topHeaderTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      marginHorizontal: 10,
    },
    reportBtn: {
      padding: 6,
    },
    scrollContent: {
      padding: 16,
      gap: 12,
      maxWidth: 800,
      width: '100%',
      alignSelf: 'center',
    },
    mainCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFF',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      gap: 8,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    typeBadge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
    },
    trendingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    trendingText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#EF4444',
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(74, 222, 128, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    verifiedText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#4ADE80',
    },
    spotTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.text,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    descriptionText: {
      fontSize: 13,
      color: theme.text,
      lineHeight: 18,
    },
    verifReasonBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(74, 222, 128, 0.1)',
      padding: 8,
      borderRadius: 8,
    },
    verifReasonText: {
      fontSize: 11,
      color: '#4ADE80',
      fontWeight: '600',
    },
    busyBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      padding: 8,
      borderRadius: 8,
    },
    busyText: {
      fontSize: 11,
      color: '#F59E0B',
      fontWeight: '700',
      flex: 1,
    },
    liveCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#001A2C' : '#F0FDF4',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(74, 222, 128, 0.3)',
      gap: 12,
    },
    liveLeft: {
      flex: 1,
    },
    liveHeading: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
    },
    liveSub: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    checkInBigBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#F59E0B',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    checkInBigBtnText: {
      fontSize: 13,
      fontWeight: '900',
      color: '#001A2C',
    },
    actionPillsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    actionPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 10,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    actionPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
    },
    sectionCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFF',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      gap: 10,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    addPhotoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    addPhotoText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary,
    },
    checkinItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    chkUserName: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    tierPill: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    tierPillText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#F59E0B',
    },
    chkNote: {
      fontSize: 12,
      color: theme.text,
      fontStyle: 'italic',
      marginTop: 2,
    },
    chkHeadcount: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 1,
    },
    chkTime: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    ratingSection: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFF',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      gap: 12,
    },
    ratingSummaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    ratingScoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    ratingScoreBig: {
      fontSize: 32,
      fontWeight: '900',
      color: '#F59E0B',
      lineHeight: 36,
    },
    ratingScaleText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    ratingMetaCol: {
      flex: 1,
      gap: 3,
    },
    starsStaticRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    ratingCountSub: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    userRateDivider: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    },
    userRateSection: {
      gap: 6,
    },
    userRatePrompt: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    starsInteractiveRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 2,
    },
    starTouchArea: {
      padding: 2,
    },
    photosScroll: {
      gap: 8,
    },
    photoThumb: {
      width: 100,
      height: 100,
      borderRadius: 10,
    },
    emptySmallText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontStyle: 'italic',
    },
    commentInputRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 6,
    },
    commentInput: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 13,
      color: theme.text,
    },
    sendCommentBtn: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      paddingHorizontal: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    commentItem: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    commentUserRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    commentAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.15)' : 'rgba(2, 132, 199, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    commentAvatarText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.primary,
    },
    commentUser: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    commentDate: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    commentBody: {
      fontSize: 13,
      color: theme.text,
      lineHeight: 18,
      paddingLeft: 32,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    reportModalCard: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: isDark ? '#0F172A' : '#FFF',
      borderRadius: 18,
      padding: 18,
      gap: 10,
    },
    reportModalTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
    },
    reportModalSub: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
    },
    reasonsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    reasonPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    reasonPillActive: {
      backgroundColor: '#EF4444',
    },
    reasonPillText: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '700',
    },
    reasonPillTextActive: {
      color: '#FFF',
    },
    reportInput: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 10,
      padding: 10,
      fontSize: 13,
      color: theme.text,
      minHeight: 70,
      textAlignVertical: 'top',
    },
    reportActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },
    cancelBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    cancelText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    confirmReportBtn: {
      backgroundColor: '#EF4444',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    confirmReportText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#FFF',
    },
    fullBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeFullBtn: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      padding: 10,
    },
    fullImg: {
      width: '90%',
      height: '80%',
    },
    btnDisabled: {
      opacity: 0.5,
    },
  });
