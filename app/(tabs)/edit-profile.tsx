import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { editProfileSchema, EditProfileSchema } from '@/features/auth/schemas/authSchemas';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormInput } from '@/components/ui/forms/FormInput';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function EditProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const [previewUri, setPreviewUri] = useState<string | null>(user?.photo || null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<EditProfileSchema>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { 
      first_name: '', 
      last_name: '', 
      email: '',
      phone: '',
      photo: ''
    },
  });

  useEffect(() => {
    if (user) {
      setValue('first_name', user.first_name || '');
      setValue('last_name', user.last_name || '');
      setValue('email', user.email || '');
      setValue('phone', (user as any).phone || '');
      if (user.photo) {
        setPreviewUri(user.photo);
      }
    }
  }, [user, setValue]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la galería para cambiar tu foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setPreviewUri(asset.uri);
        if (asset.base64) {
          const mimeType = asset.mimeType || 'image/jpeg';
          const dataUrl = `data:${mimeType};base64,${asset.base64}`;
          setValue('photo', dataUrl);
        }
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo abrir la galería de imágenes.');
    }
  };

  const onSubmit = async (data: EditProfileSchema) => {
    try {
      const payload: Record<string, any> = {};
      if (data.first_name !== undefined) payload.first_name = data.first_name;
      if (data.last_name !== undefined) payload.last_name = data.last_name;
      if (data.email !== undefined && data.email !== '') payload.email = data.email;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.photo) payload.photo = data.photo;

      await api.patch('/v1/me/', payload);
      
      // Update local state
      const updatedUser = await api.get<any>('/v1/me/', { silent: true });
      useAuthStore.setState({ user: updatedUser });
      
      Alert.alert('Éxito', 'Tu perfil ha sido actualizado.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el perfil. Revisa los datos.');
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <SafeAreaView style={GlobalStyles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>EDITAR PERFIL</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.photoContainer}
              activeOpacity={0.8}
              onPress={pickImage}
            >
              <View style={styles.photoCircle}>
                {previewUri ? (
                  <Image source={{ uri: previewUri }} style={styles.photoImage} contentFit="cover" />
                ) : (
                  <Camera size={32} color={theme.textSecondary} />
                )}
              </View>
              <Text style={{ color: theme.primary, marginTop: 8, fontWeight: '600' }}>Cambiar foto</Text>
            </TouchableOpacity>

            <FormInput
              control={control}
              name="first_name"
              label="NOMBRE"
              placeholder="Tu nombre"
            />
            <FormInput
              control={control}
              name="last_name"
              label="APELLIDO"
              placeholder="Tu apellido"
            />
            <FormInput
              control={control}
              name="email"
              label="CORREO ELECTRÓNICO"
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
            />
            <FormInput
              control={control}
              name="phone"
              label="TELÉFONO"
              placeholder="+123456789"
              keyboardType="phone-pad"
            />

            <View style={styles.buttonContainer}>
              <PrimaryButton
                label="Guardar Cambios"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.text,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    marginTop: 24,
  },
});
