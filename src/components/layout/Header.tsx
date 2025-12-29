'use client';

// 헤더 컴포넌트

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';

export function Header() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
          <span className="text-2xl">🎨</span>
          <span className="font-bold text-xl">AI 목업 생성기</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <Link href="/projects">
                <Button variant="ghost">내 프로젝트</Button>
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button>시작하기</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
