import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  rules?: object;
  required?: boolean;
  isPassword?: boolean;
  containerStyle?: object;
}

export function FormInput<T extends FieldValues>({
  label,
  name,
  control,
  rules,
  required,
  isPassword,
  containerStyle,
  placeholder,
  ...textInputProps
}: FormInputProps<T>) {
  const { theme, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const styles = createStyles(theme, isDark);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={[styles.inputContainer, containerStyle]}>
          <View style={styles.labelWrapper}>
            <Text style={styles.inputLabel}>
              {label}
              {required && <Text style={styles.requiredStar}> *</Text>}
            </Text>
          </View>

          <View style={[styles.inputWrapper, error && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={isPassword && !showPassword}
              autoCapitalize="none"
              {...textInputProps}
            />

            {isPassword && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.textSecondary} />
                ) : (
                  <Eye size={20} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {error && <Text style={styles.errorText}>{error.message || 'Este campo es requerido'}</Text>}
        </View>
      )}
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
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      height: '100%',
      // @ts-ignore - web only property
      outlineStyle: 'none',
    } as any,
    eyeIcon: {
      marginLeft: 10,
    },
    errorText: {
      color: '#ff4444',
      fontSize: 12,
      marginTop: 6,
      fontWeight: '500',
    },
  });
