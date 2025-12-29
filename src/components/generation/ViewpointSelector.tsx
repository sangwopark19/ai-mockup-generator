'use client';

// 시점 선택기 컴포넌트

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ViewpointType } from '@/types';

interface ViewpointSelectorProps {
  value?: ViewpointType;
  onChange: (value: ViewpointType | undefined) => void;
}

const viewpoints: { value: ViewpointType; label: string; icon: string }[] = [
  { value: 'front', label: '정면', icon: '⬛' },
  { value: 'three_quarter', label: '3/4 각도', icon: '◪' },
  { value: 'top', label: '위에서', icon: '⬜' },
  { value: 'bottom', label: '아래에서', icon: '▫️' },
  { value: 'preview', label: '프리뷰', icon: '📸' },
];

export function ViewpointSelector({ value, onChange }: ViewpointSelectorProps) {
  const handleSelect = (viewpoint: ViewpointType) => {
    onChange(value === viewpoint ? undefined : viewpoint);
  };

  return (
    <div className="space-y-3">
      <Label>시점 선택</Label>
      
      <div className="grid grid-cols-5 gap-2">
        {viewpoints.map((viewpoint) => (
          <button
            key={viewpoint.value}
            type="button"
            onClick={() => handleSelect(viewpoint.value)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
              value === viewpoint.value
                ? 'border-primary bg-primary/10'
                : 'border-muted hover:border-primary/50'
            )}
          >
            <span className="text-xl mb-1">{viewpoint.icon}</span>
            <span className="text-xs">{viewpoint.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
