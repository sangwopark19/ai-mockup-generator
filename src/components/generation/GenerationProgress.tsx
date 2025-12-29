'use client';

// 생성 진행 상태 컴포넌트

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GenerationProgressProps {
  isGenerating: boolean;
  progress?: number;
}

const loadingMessages = [
  '이미지를 분석하고 있습니다...',
  'AI가 창의력을 발휘하고 있습니다...',
  '멋진 목업을 생성하고 있습니다...',
  '디테일을 다듬고 있습니다...',
  '거의 완료되었습니다...',
];

export function GenerationProgress({ isGenerating, progress = 0 }: GenerationProgressProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isGenerating) {
      setMessageIndex(0);
      return;
    }

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, [isGenerating]);

  if (!isGenerating) {
    return null;
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* 애니메이션 로딩 */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/30 rounded-full" />
          <div
            className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🎨</span>
          </div>
        </div>

        {/* 메시지 */}
        <div className="text-center">
          <p className="text-lg font-medium">
            {loadingMessages[messageIndex]}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            잠시만 기다려 주세요{dots}
          </p>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-full max-w-xs">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full bg-primary transition-all duration-300',
                progress === 0 && 'animate-pulse'
              )}
              style={{ width: progress > 0 ? `${progress}%` : '30%' }}
            />
          </div>
          {progress > 0 && (
            <p className="text-xs text-center text-muted-foreground mt-1">
              {progress}%
            </p>
          )}
        </div>

        {/* 팁 */}
        <p className="text-xs text-muted-foreground text-center max-w-sm">
          💡 팁: AI가 목업 이미지를 생성하고 있습니다!
        </p>
      </div>
    </Card>
  );
}
