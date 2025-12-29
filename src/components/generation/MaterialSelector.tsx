'use client';

// 재질 선택기 컴포넌트

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { MaterialType } from '@/types';

interface MaterialSelectorProps {
  value?: { type: MaterialType; customDescription?: string };
  onChange: (value: { type: MaterialType; customDescription?: string } | undefined) => void;
}

const materials: { value: MaterialType; label: string; emoji: string }[] = [
  { value: 'plastic_glossy', label: '플라스틱 (광택)', emoji: '✨' },
  { value: 'plastic_matte', label: '플라스틱 (무광)', emoji: '🎨' },
  { value: 'plush_fabric', label: '봉제 (천)', emoji: '🧸' },
  { value: 'plush_fur', label: '봉제 (털)', emoji: '🐻' },
  { value: 'ceramic', label: '세라믹', emoji: '🏺' },
  { value: 'porcelain', label: '도자기', emoji: '🍵' },
  { value: 'transparent_plastic', label: '투명 플라스틱', emoji: '💎' },
  { value: 'transparent_glass', label: '투명 유리', emoji: '🔮' },
];

export function MaterialSelector({ value, onChange }: MaterialSelectorProps) {
  const handleTypeChange = (type: MaterialType) => {
    onChange({ type, customDescription: value?.customDescription });
  };

  const handleDescriptionChange = (customDescription: string) => {
    if (value?.type) {
      onChange({ ...value, customDescription });
    }
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>재질 선택</Label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            초기화
          </button>
        )}
      </div>
      
      <Select
        value={value?.type || ''}
        onValueChange={(v) => handleTypeChange(v as MaterialType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="재질을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {materials.map((material) => (
            <SelectItem key={material.value} value={material.value}>
              <span className="flex items-center gap-2">
                <span>{material.emoji}</span>
                <span>{material.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value?.type && (
        <Input
          placeholder="추가 설명 (선택사항): 예) 반투명, 살짝 거친 질감"
          value={value.customDescription || ''}
          onChange={(e) => handleDescriptionChange(e.target.value)}
        />
      )}
    </div>
  );
}
