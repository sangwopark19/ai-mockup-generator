'use client';

// 로그인 폼 컴포넌트

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const { setUser, setTokens, isHydrated, isAuthenticated, accessToken } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (isHydrated && isAuthenticated && accessToken) {
      router.push('/dashboard');
    }
  }, [isHydrated, isAuthenticated, accessToken, router]);

  // Hydration 대기 중 또는 이미 인증된 경우 로딩 표시
  if (!isHydrated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // 이미 인증된 경우 리다이렉트 중
  if (isAuthenticated && accessToken) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // 상태 저장
      setUser(data.data.user);
      setTokens(data.data.accessToken, data.data.refreshToken);
      
      toast.success('로그인되었습니다.');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          AI 목업 생성기에 로그인하세요
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              회원가입
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
