// 회원가입 페이지

import { SignupForm } from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="text-3xl">🎨</span>
        <span className="text-2xl font-bold text-white">AI 목업 생성기</span>
      </Link>
      <SignupForm />
    </div>
  );
}
