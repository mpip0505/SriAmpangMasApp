import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      full_name: string;
      role: string;
      community_id: string;
      community_name: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    // Store tokens and user data
    await AsyncStorage.setItem('accessToken', response.data.data.tokens.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));

    return response.data;
  },

  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  },
};