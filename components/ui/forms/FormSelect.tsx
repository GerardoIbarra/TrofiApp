import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  options: Option[];
  rules?: object;
  required?: boolean;
  containerStyle?: object;
  placeholder?: string;
}

export function FormSelect<T extends FieldValues>({
  label,
  name,
  control,
  options,
  rules,
  required,
  containerStyle,
  placeholder = 'Seleccionar opción',
}: FormSelectProps<T>) {
  const { theme, isDark } = useTheme();
  const [show, setShow] = useState(false);
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDark, insets);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedOption = options.find(opt => opt.value === value);

        return (
          <View style={[styles.inputContainer, containerStyle]}>
            <View style={styles.labelWrapper}>
              <Text style={styles.inputLabel}>
                {label}
                {required && <Text style={styles.requiredStar}> *</Text>}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShow(true)}
              style={[styles.inputWrapper, error && styles.inputError]}
            >
              <Text style={[styles.dateText, !value && styles.placeholderText]}>
                {selectedOption ? selectedOption.label : placeholder}
              </Text>
              <ChevronDown size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <Modal
              visible={show}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShow(false)}
            >
              <View style={styles.modalOverlay}>
                <TouchableOpacity 
                  style={styles.dismissArea} 
                  activeOpacity={1} 
                  onPress={() => setShow(false)} 
                />
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View style={styles.handle} />
                    <Text style={styles.modalTitle}>{label}</Text>
                  </View>

                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => {
                      const isSelected = item.value === value;
                      return (
                        <TouchableOpacity
                          style={[styles.optionItem, isSelected && styles.selectedOption]}
                          onPress={() => {
                            onChange(item.value);
                            setShow(false);
                          }}
                        >
                          <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                            {item.label}
                          </Text>
                          {isSelected && <Check size={18} color={theme.primary} />}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </View>
            </Modal>

            {error && <Text style={styles.errorText}>{error.message || 'Este campo es requerido'}</Text>}
          </View>
        );
      }}
    />
  );
}

const createStyles = (theme: any, isDark: boolean, insets: any) =>
  StyleSheet.create({
    inputContainer: {
      marginBottom: 20,
    },
    labelWrapper: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    inputLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    requiredStar: {
      color: theme.primary,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      paddingHorizontal: 15,
      height: 56,
    },
    inputError: {
      borderColor: '#ff4444',
    },
    dateText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
    placeholderText: {
      color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      fontWeight: '400',
    },
    errorText: {
      color: '#ff4444',
      fontSize: 12,
      marginTop: 6,
      fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    dismissArea: {
      flex: 1,
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      minHeight: 300,
      maxHeight: '80%',
      paddingBottom: Math.max(insets.bottom, 20),
    },
    modalHeader: {
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    handle: {
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 14,
      fontWeight: '900',
      color: theme.textSecondary,
      letterSpacing: 2,
    },
    listContent: {
      padding: 20,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 16,
      marginBottom: 8,
    },
    selectedOption: {
      backgroundColor: theme.primary + '10',
    },
    optionText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
    selectedOptionText: {
      color: theme.primary,
      fontWeight: '700',
    },
  });
