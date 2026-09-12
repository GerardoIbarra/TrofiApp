import { Share, Alert } from 'react-native';
import api from '@/services/api';
import { SharePayload } from '../types/share';

export async function shareStandings(tournamentId: string, group?: string): Promise<void> {
  try {
    let endpoint = `/v1/standings/share/?tournament_id=${tournamentId}`;
    if (group) {
      endpoint += `&group=${encodeURIComponent(group)}`;
    }
    const data = await api.get<SharePayload>(endpoint);
    if (!data?.text) {
      throw new Error('No se recibió el texto para compartir.');
    }

    await Share.share({
      title: data.title || 'Tabla de posiciones',
      message: data.text,
    });
  } catch (err: any) {
    if (err?.message !== 'User did not share' && !err?.message?.includes('dismissed')) {
      console.error('Error sharing standings:', err);
      Alert.alert('Error al compartir', err?.message || 'No se pudo compartir la tabla de posiciones.');
    }
  }
}

export async function shareMatch(matchId: string): Promise<void> {
  try {
    const data = await api.get<SharePayload>(`/v1/matches/${matchId}/share/`);
    if (!data?.text) {
      throw new Error('No se recibió el texto para compartir.');
    }

    await Share.share({
      title: data.title || 'Partido',
      message: data.text,
    });
  } catch (err: any) {
    if (err?.message !== 'User did not share' && !err?.message?.includes('dismissed')) {
      console.error('Error sharing match:', err);
      Alert.alert('Error al compartir', err?.message || 'No se pudo compartir el partido.');
    }
  }
}
