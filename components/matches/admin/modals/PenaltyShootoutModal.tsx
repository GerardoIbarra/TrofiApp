import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Match } from '@/features/tournaments/types/match';
import { useTheme } from '@/context/ThemeContext';
import { X } from 'lucide-react-native';

interface PenaltyShootoutModalProps {
  visible: boolean;
  onClose: () => void;
  match: Match;
}

export function PenaltyShootoutModal({ visible, onClose, match }: PenaltyShootoutModalProps) {
  const { theme } = useTheme();
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: theme.surface, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 500 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>Tanda de Penales</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: theme.textSecondary }}>Work in progress: Tanda interactiva...</Text>
        </View>
      </View>
    </Modal>
  );
}
