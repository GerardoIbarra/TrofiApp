import { useAuthStore } from '../authStore';
import { AuthStorage } from '@/features/auth/services/authStorage';
import { router } from 'expo-router';

jest.mock('@/features/auth/services/authStorage', () => ({
  AuthStorage: {
    getUser: jest.fn(),
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    saveTokens: jest.fn(),
    saveUser: jest.fn(),
    clearSession: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    canDismiss: jest.fn(() => false),
    dismissAll: jest.fn(),
  },
}));

jest.mock('@/services/notifications', () => ({
  unregisterDeviceToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@/services/logger', () => ({
  logger: {
    setUser: jest.fn(),
    clearUser: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/services/metrics', () => ({
  metrics: {
    trackAuthEvent: jest.fn(),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('should initialize with authenticated user if tokens exist', async () => {
    const mockUser = { id: 'usr-1', email: 'test@trofiapp.com', username: 'trofi_fan' } as any;
    (AuthStorage.getUser as jest.Mock).mockResolvedValue(mockUser);
    (AuthStorage.getAccessToken as jest.Mock).mockResolvedValue('valid-jwt-token');

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
  });

  it('should initialize as unauthenticated if no stored user', async () => {
    (AuthStorage.getUser as jest.Mock).mockResolvedValue(null);
    (AuthStorage.getAccessToken as jest.Mock).mockResolvedValue(null);

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should clear session and state on signOut', async () => {
    useAuthStore.setState({
      user: { id: 'usr-1', email: 'test@trofiapp.com' } as any,
      isAuthenticated: true,
      isLoading: false,
    });

    (AuthStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token');
    (AuthStorage.clearSession as jest.Mock).mockResolvedValue(undefined);

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(AuthStorage.clearSession).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(auth)');
  });
});
