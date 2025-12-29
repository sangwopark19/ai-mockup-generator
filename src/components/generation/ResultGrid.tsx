'use client';

// 생성 결과 그리드 컴포넌트

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ResultGridProps {
  images: string[];
  isLoading?: boolean;
  selectedImage: string | null;
  onSelect: (image: string) => void;
  onDownload?: (image: string) => void;
  onEdit?: (image: string) => void;
  onFavorite?: (image: string) => void;
}

export function ResultGrid({
  images,
  isLoading,
  selectedImage,
  onSelect,
  onDownload,
  onEdit,
  onFavorite,
}: ResultGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p>생성된 이미지가 없습니다</p>
          <p className="text-sm mt-1">이미지를 업로드하고 생성 버튼을 클릭하세요</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 결과 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Card
              className={cn(
                'overflow-hidden cursor-pointer transition-all duration-200',
                selectedImage === image && 'ring-2 ring-primary'
              )}
              onClick={() => onSelect(image)}
            >
              <img
                src={image}
                alt={`생성 결과 ${index + 1}`}
                className="w-full aspect-square object-cover"
              />
            </Card>

            {/* 호버 시 액션 버튼 */}
            {hoveredIndex === index && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(image);
                  }}
                >
                  선택
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 선택된 이미지 상세 */}
      {selectedImage && (
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <img
                src={selectedImage}
                alt="선택된 이미지"
                className="w-full max-h-96 object-contain rounded-lg bg-muted"
              />
            </div>
            <div className="flex flex-col gap-2 lg:w-48">
              <h3 className="font-medium mb-2">선택된 이미지</h3>
              {onDownload && (
                <Button onClick={() => onDownload(selectedImage)}>
                  다운로드
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(selectedImage)}>
                  부분 편집
                </Button>
              )}
              {onFavorite && (
                <Button variant="outline" onClick={() => onFavorite(selectedImage)}>
                  즐겨찾기 저장
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
