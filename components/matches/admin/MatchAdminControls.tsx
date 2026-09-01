import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Match } from '@/features/tournaments/types/match';
import { Play, Pause, Square, AlertCircle, Goal, Flag, Users, Edit3, UserPlus } from 'lucide-react-native';
import { useStartMatch, usePauseMatch, useResumeMatch, useEndMatch } from '@/features/matches/services/liveMatchApi';
import { useTranslation } from 'react-i18next';

// Modals
import { AddEventModal } from './modals/AddEventModal';
import { SubstituteModal } from './modals/SubstituteModal';
import { MatchStatusModal } from './modals/MatchStatusModal';
import { AssignRefereeModal } from './modals/AssignRefereeModal';
import { PenaltyShootoutModal } from './modals/PenaltyShootoutModal';

interface MatchAdminControlsProps {
  match: Match;
}

export function MatchAdminControls({ match }: MatchAdminControlsProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  // API Hooks
  const startMatch = useStartMatch();
  const pauseMatch = usePauseMatch();
  const resumeMatch = useResumeMatch();
  const endMatch = useEndMatch();

  // Modals state
  const [isEventModalVisible, setEventModalVisible] = useState(false);
  const [isSubModalVisible, setSubModalVisible] = useState(false);
  const [isStatusModalVisible, setStatusModalVisible] = useState(false);
  const [isRefereeModalVisible, setRefereeModalVisible] = useState(false);
  const [isPenaltyModalVisible, setPenaltyModalVisible] = useState(false);

  const handleStart = () => {
    Alert.alert('Comenzar Partido', '¿Estás seguro que deseas iniciar el partido?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Iniciar', onPress: () => startMatch.mutate(match.id) },
    ]);
  };

  const handleEnd = () => {
    Alert.alert('Finalizar Partido', '¿Estás seguro que deseas terminar el partido?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Terminar', style: 'destructive', onPress: () => endMatch.mutate(match.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administrador / Árbitro</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsContainer}>
        {/* SCHEDULED */}
        {match.status === 'scheduled' && (
          <>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleStart} disabled={startMatch.isPending}>
              <Play size={16} color="#001A2C" />
              <Text style={[styles.btnText, { color: '#001A2C' }]}>Iniciar Partido</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setRefereeModalVisible(true)}>
              <UserPlus size={16} color={theme.text} />
              <Text style={styles.btnTextSecondary}>Asignar Árbitro</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary} onPress={() => setStatusModalVisible(true)}>
              <AlertCircle size={16} color={theme.text} />
              <Text style={styles.btnTextSecondary}>Posponer/Cancelar</Text>
            </TouchableOpacity>
          </>
        )}

        {/* LIVE */}
        {match.status === 'live' && (
          <>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#4CAF50' }]} onPress={() => setEventModalVisible(true)}>
              <Goal size={16} color="#FFF" />
              <Text style={[styles.btnText, { color: '#FFF' }]}>Añadir Evento</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, { backgroundColor: '#2196F3' }]} onPress={() => setSubModalVisible(true)}>
              <Users size={16} color="#FFF" />
              <Text style={[styles.btnText, { color: '#FFF' }]}>Sustitución</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnSecondary, { borderColor: '#FF9800' }]} onPress={() => pauseMatch.mutate(match.id)}>
              <Pause size={16} color="#FF9800" />
              <Text style={[styles.btnTextSecondary, { color: '#FF9800' }]}>Pausar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnSecondary, { borderColor: '#F44336' }]} onPress={handleEnd}>
              <Square size={16} color="#F44336" />
              <Text style={[styles.btnTextSecondary, { color: '#F44336' }]}>Terminar</Text>
            </TouchableOpacity>
          </>
        )}

        {/* PAUSED */}
        {match.status === 'paused' && (
          <>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF9800' }]} onPress={() => resumeMatch.mutate(match.id)}>
              <Play size={16} color="#FFF" />
              <Text style={[styles.btnText, { color: '#FFF' }]}>Reanudar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary} onPress={() => setStatusModalVisible(true)}>
              <AlertCircle size={16} color={theme.text} />
              <Text style={styles.btnTextSecondary}>Posponer/Cancelar</Text>
            </TouchableOpacity>
          </>
        )}

        {/* PLAYED / FINISHED */}
        {match.status === 'played' && (
          <>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#9C27B0' }]}>
              <Edit3 size={16} color="#FFF" />
              <Text style={[styles.btnText, { color: '#FFF' }]}>Editar Resultado</Text>
            </TouchableOpacity>

            {match.result && match.result.home_score === match.result.away_score && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF5722' }]} onPress={() => setPenaltyModalVisible(true)}>
                <Goal size={16} color="#FFF" />
                <Text style={[styles.btnText, { color: '#FFF' }]}>Resolver Penales</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <AddEventModal visible={isEventModalVisible} onClose={() => setEventModalVisible(false)} match={match} />
      <SubstituteModal visible={isSubModalVisible} onClose={() => setSubModalVisible(false)} match={match} />
      <MatchStatusModal visible={isStatusModalVisible} onClose={() => setStatusModalVisible(false)} match={match} />
      <AssignRefereeModal visible={isRefereeModalVisible} onClose={() => setRefereeModalVisible(false)} match={match} />
      <PenaltyShootoutModal visible={isPenaltyModalVisible} onClose={() => setPenaltyModalVisible(false)} match={match} />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  actionsContainer: {
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    gap: 8,
  },
  btnTextSecondary: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
