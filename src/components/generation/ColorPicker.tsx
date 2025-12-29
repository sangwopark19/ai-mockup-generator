'use client';

// 색상 선택기 컴포넌트

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { ColorSettings } from '@/types';

interface ColorPickerProps {
  value?: ColorSettings;
  onChange: (value: ColorSettings | undefined) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const handleModeChange = (useCharacterColors: boolean) => {
    if (useCharacterColors) {
      onChange({ mode: 'from_character' });
    } else {
      onChange({ mode: 'custom', customColor: value?.customColor || '#000000' });
    }
  };

  const handleColorChange = (color: string) => {
    onChange({ mode: 'custom', customColor: color });
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>색상 설정</Label>
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

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">캐릭터 색상 사용</Label>
          <p className="text-xs text-muted-foreground">
            입력 캐릭터 이미지에서 색상 추출
          </p>
        </div>
        <Switch
          checked={value?.mode === 'from_character'}
          onCheckedChange={handleModeChange}
        />
      </div>

      {value?.mode !== 'from_character' && (
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg border-2 border-muted cursor-pointer"
            style={{ backgroundColor: value?.customColor || '#ffffff' }}
          />
          <div className="flex-1">
            <Label htmlFor="customColor">커스텀 색상</Label>
            <Input
              id="customColor"
              type="color"
              value={value?.customColor || '#ffffff'}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-10 cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="hexCode">HEX 코드</Label>
            <Input
              id="hexCode"
              type="text"
              value={value?.customColor || '#ffffff'}
              onChange={(e) => {
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                  handleColorChange(e.target.value);
                }
              }}
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
}
