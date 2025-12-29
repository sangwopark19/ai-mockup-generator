// 인증 상태 관리 스토어
// Zustand를 사용한 전역 상태 관리

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserWithoutPassword } from '@/types';

interface AuthState {
  // 상태
  user: UserWithoutPassword | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 액션
  setUser: (user: UserWithoutPassword | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      // 사용자 설정
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      // 토큰 설정
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      // 인증 정보 초기화 (로그아웃)
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // 로딩 상태 설정
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage', // localStorage 키
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
