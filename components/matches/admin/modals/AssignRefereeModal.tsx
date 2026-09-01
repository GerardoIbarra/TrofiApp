import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Match } from '@/features/tournaments/types/match';
import { useTheme } from '@/context/ThemeContext';
import { X } from 'lucide-react-native';

interface AssignRefereeModalProps {
  visible: boolean;
  onClose: () => void;
  match: Match;
}

export function AssignRefereeModal({ visible, onClose, match }: AssignRefereeModalProps) {
  const { theme } = useTheme();
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: theme.surface, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 400 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>Asignar Árbitro</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: theme.textSecondary }}>Work in progress: Buscador de usuarios para ser referí...</Text>
        </View>
      </View>
    </Modal>
  );
}
