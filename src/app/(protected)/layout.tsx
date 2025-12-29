// 인증 필수 영역 레이아웃

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/layout/Header';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
