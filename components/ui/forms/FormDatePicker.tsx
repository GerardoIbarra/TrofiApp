import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface FormDatePickerProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  rules?: object;
  required?: boolean;
  containerStyle?: object;
  placeholder?: string;
}

export function FormDatePicker<T extends FieldValues>({
  label,
  name,
  control,
  rules,
  required,
  containerStyle,
  placeholder = 'Seleccionar fecha',
}: FormDatePickerProps<T>) {
  const { theme, isDark } = useTheme();
  const [show, setShow] = useState(false);
  const styles = createStyles(theme, isDark);

  const formatDate = (dateString: string) => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    // Formato premium: "19 Abr, 2026"
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const currentDate = value ? new Date(value) : new Date();

        const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
          // En Android, el picker se cierra al seleccionar
          if (Platform.OS === 'android') {
            setShow(false);
          }
          
          if (event.type === 'set' && selectedDate) {
            const dateString = selectedDate.toISOString().split('T')[0];
            onChange(dateString);
          } else if (event.type === 'dismissed') {
            setShow(false);
          }
        };

        return (
          <View style={[styles.inputContainer, containerStyle]}>
            <View style={styles.labelWrapper}>
              <Text
                style={styles.inputLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {label}
                {required && <Text style={styles.requiredStar}> *</Text>}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShow(true)}
              style={[styles.inputWrapper, error && styles.inputError]}
            >
              <Text
                style={[styles.dateText, !value && styles.placeholderText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {formatDate(value)}
              </Text>
              <CalendarIcon size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
              <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShow(false)}>
                  <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
                    <View style={styles.modalGrabber} />
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShow(false)}>
                        <Text style={styles.doneText}>Listo</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={currentDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      textColor={isDark ? '#FFFFFF' : '#000000'}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Modal>
            ) : (
              show && (
                <DateTimePicker
                  value={currentDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )
            )}

            {error && <Text style={styles.errorText}>{error.message || 'Este campo es requerido'}</Text>}
          </View>
        );
      }}
    />
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    inputContainer: {
      marginBottom: 20,
    },
    labelWrapper: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    inputLabel: {
      flexShrink: 1,
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
      gap: 8,
    },
    inputError: {
      borderColor: '#ff4444',
    },
    dateText: {
      flex: 1,
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
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
    },
    modalContent: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 20,
    },
    modalGrabber: {
      alignSelf: 'center',
      width: 36,
      height: 5,
      borderRadius: 3,
      marginTop: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    doneText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.primary,
    },
  });
