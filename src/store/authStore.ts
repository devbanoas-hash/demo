import { create } from 'zustand';
import { setTokenToStorage, clearTokenFromStorage, getTokenFromStorage } from '@/utils/tokenManager';
import { decodeJWT, getUserFromToken } from '@/utils/jwt';

interface AuthState {
  accessToken: string | null;
  user: {
    user_id: string;
    email: string;
    username: string;
    role_name: string;
  } | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (token: string, email?: string, username?: string) => void;
  logout: () => void;
  initializeAuth: () => void;
  getRoleName: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, email, username) => {
    setTokenToStorage(token);
    
    // Decode token to get user info
    const userInfo = getUserFromToken(token);
    
    if (userInfo) {
      set({
        accessToken: token,
        user: {
          user_id: userInfo.user_id,
          role_name: userInfo.role_name,
          email: email || '',
          username: username || '',
        },
        isAuthenticated: true,
      });
    } else {
      // If token decode fails, still set token but without user info
      set({
        accessToken: token,
        user: null,
        isAuthenticated: true,
      });
    }
  },

  logout: () => {
    clearTokenFromStorage();
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  initializeAuth: () => {
    const token = getTokenFromStorage();
    if (token) {
      // Decode token to restore user info
      const userInfo = getUserFromToken(token);
      
      if (userInfo) {
        set({
          accessToken: token,
          user: {
            user_id: userInfo.user_id,
            role_name: userInfo.role_name,
            email: '',
            username: '',
          },
          isAuthenticated: true,
        });
      } else {
        // Token expired or invalid, clear it
        clearTokenFromStorage();
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      }
    }
  },

  getRoleName: () => {
    const state = get();
    return state.user?.role_name || null;
  },
}));
