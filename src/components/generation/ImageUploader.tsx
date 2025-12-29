'use client';

// 이미지 업로더 컴포넌트

import { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  label: string;
  description?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  className?: string;
}

export function ImageUploader({
  label,
  description,
  value,
  onChange,
  accept = 'image/*',
  className,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      onChange(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    setPreview(null);
  }, [onChange]);

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        isDragging && 'ring-2 ring-primary',
        className
      )}
    >
      <div
        className="p-6"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="미리보기"
              className="w-full h-48 object-contain rounded-lg bg-muted"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              제거
            </Button>
            <p className="mt-2 text-sm text-center text-muted-foreground">
              {value?.name}
            </p>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
            <div className="flex flex-col items-center justify-center gap-2">
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">{label}</span>
              {description && (
                <span className="text-xs text-muted-foreground">{description}</span>
              )}
              <span className="text-xs text-muted-foreground">
                드래그 앤 드롭 또는 클릭하여 업로드
              </span>
            </div>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleInputChange}
            />
          </label>
        )}
      </div>
    </Card>
  );
}
