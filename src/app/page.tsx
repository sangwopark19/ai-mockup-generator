// 랜딩 페이지

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: '🔄',
    title: 'IP 캐릭터 교체',
    description: '기존 제품 이미지에서 캐릭터만 교체하여 새로운 목업을 생성합니다.',
  },
  {
    icon: '✏️',
    title: '스케치 → 실사',
    description: '2D 디자인 스케치를 실제 제품처럼 보이는 목업으로 변환합니다.',
  },
  {
    icon: '🖼️',
    title: '배경 합성',
    description: '캐릭터 이미지를 제품에 자연스럽게 합성합니다.',
  },
  {
    icon: '🎨',
    title: '부분 편집',
    description: '생성된 이미지의 특정 부분만 수정할 수 있는 인페인팅 기능을 제공합니다.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 헤더 */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎨</span>
            <span className="text-xl font-bold text-white">AI 목업 생성기</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-purple-900 hover:bg-white/90">
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* 히어로 섹션 */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          제품 목업을
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
            AI로 쉽게 생성
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          디자이너의 아이디어를 현실로 만들어 주는 AI 기반 목업 생성 도구.
          <br />
          IP 캐릭터 교체, 스케치 변환, 배경 합성까지 한 번에!
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-lg px-8 py-6">
              지금 시작하기 →
            </Button>
          </Link>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          강력한 기능
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <div className="text-4xl mb-2">{feature.icon}</div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 워크플로우 */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          간단한 3단계
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">이미지 업로드</h3>
            <p className="text-gray-300">제품 사진과 캐릭터 이미지를 업로드합니다</p>
          </div>
          <div className="text-4xl text-white/50 hidden md:block">→</div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">옵션 설정</h3>
            <p className="text-gray-300">재질, 색상, 시점 등을 선택합니다</p>
          </div>
          <div className="text-4xl text-white/50 hidden md:block">→</div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">목업 생성</h3>
            <p className="text-gray-300">AI가 고품질 목업을 생성합니다</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-pink-500/20 to-violet-500/20 border-white/20 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-gray-300 mb-8">
              복잡한 설치 없이 웹 브라우저에서 바로 사용할 수 있습니다
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90 text-lg px-8">
                무료로 시작하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* 푸터 */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <span>© 2024 AI 목업 생성기. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white">이용약관</Link>
            <Link href="#" className="hover:text-white">개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
