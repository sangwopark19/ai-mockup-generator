'use client';

// 인증 가드 컴포넌트
// 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
// Zustand hydration 완료 후 인증 상태 확인

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { 
    accessToken, 
    refreshToken,
    isAuthenticated,
    user,
    setUser, 
    setTokens,
    setLoading, 
    isLoading,
    isHydrated,
    clearAuth,
  } = useAuthStore();
  
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Hydration이 완료될 때까지 대기
      if (!isHydrated) {
        return;
      }

      // 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!accessToken) {
        setIsChecking(false);
        router.push('/login');
        return;
      }

      // 이미 사용자 정보가 있으면 API 호출 스킵
      if (user && isAuthenticated) {
        setIsChecking(false);
        setLoading(false);
        return;
      }

      try {
        // 현재 사용자 정보 조회 (토큰 유효성 확인)
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else if (response.status === 401 && refreshToken) {
          // 토큰 만료 시 리프레시 토큰으로 갱신 시도
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
            setUser(refreshData.data.user);
          } else {
            // 리프레시도 실패하면 로그아웃
            clearAuth();
            router.push('/login');
            return;
          }
        } else {
          // 인증 실패
          clearAuth();
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('인증 확인 오류:', error);
        clearAuth();
        router.push('/login');
        return;
      } finally {
        setIsChecking(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [
    isHydrated, 
    accessToken, 
    refreshToken, 
    user, 
    isAuthenticated,
    router, 
    setUser, 
    setTokens,
    setLoading,
    clearAuth,
  ]);

  // Hydration이 완료되지 않았거나 체크 중일 때 로딩 표시
  if (!isHydrated || isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="text-center text-sm text-muted-foreground mt-4">
            인증 확인 중...
          </div>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 (리다이렉트 중)
  if (!accessToken || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
