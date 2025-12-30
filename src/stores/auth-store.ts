// 인증 상태 관리 스토어
// Zustand를 사용한 전역 상태 관리

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserWithoutPassword } from '@/types';

interface AuthState {
  // 상태
  user: UserWithoutPassword | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean; // hydration 완료 여부

  // 액션
  setUser: (user: UserWithoutPassword | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setHydrated: (isHydrated: boolean) => void;
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
      isHydrated: false,

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
          isAuthenticated: true,
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

      // Hydration 상태 설정
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: 'auth-storage', // localStorage 키
      storage: createJSONStorage(() => localStorage),
      // 저장할 상태만 지정 (user 정보도 저장)
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Hydration 완료 시 콜백
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          state.setLoading(false);
        }
      },
    }
  )
);

// Hydration 상태를 확인하는 유틸리티 함수
export const waitForHydration = (): Promise<void> => {
  return new Promise((resolve) => {
    const state = useAuthStore.getState();
    if (state.isHydrated) {
      resolve();
      return;
    }

    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isHydrated) {
        unsubscribe();
        resolve();
      }
    });
  });
};
