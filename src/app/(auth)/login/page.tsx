// 로그인 페이지

import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="text-3xl">🎨</span>
        <span className="text-2xl font-bold text-white">AI 목업 생성기</span>
      </Link>
      <LoginForm />
    </div>
  );
}
