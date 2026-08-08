import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/features/auth/types/auth';

const TOKEN_KEY = 'trofi_access_token';
const REFRESH_TOKEN_KEY = 'trofi_refresh_token';
const USER_KEY = 'trofi_user_data';

export const AuthStorage = {
  async saveTokens(access: string, refresh: string) {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(TOKEN_KEY, access);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, access);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
      }
    } catch (e) {
      console.error('Error saving tokens', e);
    }
  },

  async saveUser(user: User) {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.error('Error saving user data', e);
    }
  },

  async getAccessToken() {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  },

  async getRefreshToken() {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
  },

  async getUser(): Promise<User | null> {
    const data = Platform.OS === 'web' 
      ? await AsyncStorage.getItem(USER_KEY)
      : await SecureStore.getItemAsync(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  async clearSession() {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      console.error('Error clearing session', e);
    }
  },

  async saveAccessToken(access: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(TOKEN_KEY, access);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, access);
    }
  }
};

