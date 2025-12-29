'use client';

// 인증 가드 컴포넌트
// 인증되지 않은 사용자를 로그인 페이지로 리다이렉트

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { accessToken, setUser, setLoading, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!accessToken) {
        router.push('/login');
        return;
      }

      try {
        // 현재 사용자 정보 조회
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else {
          // 토큰 만료 등의 경우
          router.push('/login');
        }
      } catch (error) {
        console.error('인증 확인 오류:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [accessToken, router, setUser, setLoading]);

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
