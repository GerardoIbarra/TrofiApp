import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Radio, Check, FileText } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSetRefereeAvailability } from '@/features/referees/services/refereeApi';

interface RefereeAvailabilityToggleProps {
  initialIsOpen?: boolean;
  initialNotes?: string;
  onUpdated?: () => void;
}

export const RefereeAvailabilityToggle: React.FC<RefereeAvailabilityToggleProps> = ({
  initialIsOpen = false,
  initialNotes = '',
  onUpdated,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [notes, setNotes] = useState(initialNotes);
  const setAvailabilityMutation = useSetRefereeAvailability();

  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);

  useEffect(() => {
    if (initialNotes) {
      setNotes(initialNotes);
    }
  }, [initialNotes]);

  const handleSave = () => {
    setAvailabilityMutation.mutate(
      {
        is_open: isOpen,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Disponibilidad Actualizada',
            isOpen
              ? 'Ahora apareces como disponible en el Mercado de Árbitros para recibir ofertas de partidos.'
              : 'Has desactivado tu disponibilidad para nuevas ofertas.'
          );
          onUpdated?.();
        },
        onError: (err: any) => {
          const detail =
            err?.response?.data?.detail ||
            err?.message ||
            'Necesitas tener un perfil de Árbitro activo para gestionar disponibilidad.';
          Alert.alert('Error', detail);
        },
      }
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Radio size={20} color={isOpen ? '#10B981' : theme.textSecondary} />
          <View>
            <Text style={[styles.title, { color: theme.text }]}>
              Mercado de Árbitros
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {isOpen
                ? 'Actualmente disponible para recibir ofertas'
                : 'Pausado — No apareces en búsquedas de ligas'}
            </Text>
          </View>
        </View>

        <Switch
          value={isOpen}
          onValueChange={setIsOpen}
          trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {isOpen && (
        <View style={styles.notesContainer}>
          <View style={styles.notesHeader}>
            <FileText size={14} color={theme.textSecondary} />
            <Text style={[styles.notesLabel, { color: theme.textSecondary }]}>
              Notas de disponibilidad (Opcional):
            </Text>
          </View>
          <TextInput
            style={[
              styles.notesInput,
              {
                color: theme.text,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              },
            ]}
            placeholder="Ej: Libre sábados en la tarde, zona norte"
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            maxLength={250}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: theme.primary }]}
        onPress={handleSave}
        disabled={setAvailabilityMutation.isPending}
      >
        {setAvailabilityMutation.isPending ? (
          <ActivityIndicator size="small" color="#001A2C" />
        ) : (
          <View style={styles.btnContent}>
            <Check size={16} color="#001A2C" />
            <Text style={styles.saveBtnText}>Guardar Estado</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      paddingRight: 10,
    },
    title: {
      fontSize: 15,
      fontWeight: '800',
    },
    subtitle: {
      fontSize: 12,
      marginTop: 2,
    },
    notesContainer: {
      marginTop: 14,
    },
    notesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginBottom: 6,
    },
    notesLabel: {
      fontSize: 12,
      fontWeight: '600',
    },
    notesInput: {
      height: 42,
      borderRadius: 10,
      paddingHorizontal: 12,
      fontSize: 13,
      borderWidth: 1,
    },
    saveBtn: {
      height: 42,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 14,
    },
    btnContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    saveBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
  });
