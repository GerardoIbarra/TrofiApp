import * as SecureStore from 'expo-secure-store';
import { User } from '@/types/auth';

const TOKEN_KEY = 'trofi_access_token';
const REFRESH_TOKEN_KEY = 'trofi_refresh_token';
const USER_KEY = 'trofi_user_data';

export const AuthStorage = {
  async saveTokens(access: string, refresh: string) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, access);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
    } catch (e) {
      console.error('Error saving tokens', e);
    }
  },

  async saveUser(user: User) {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user data', e);
    }
  },

  async getAccessToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async getRefreshToken() {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async getUser(): Promise<User | null> {
    const data = await SecureStore.getItemAsync(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  async clearSession() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (e) {
      console.error('Error clearing session', e);
    }
  },

  async saveAccessToken(access: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, access);
  }
};
