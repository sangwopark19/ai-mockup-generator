'use client';

// 새 프로젝트 생성 페이지

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectStore } from '@/stores/project-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { CategoryType } from '@/types';

const categories: { value: CategoryType; label: string; emoji: string }[] = [
  { value: 'general_goods', label: '일반 상품', emoji: '📦' },
  { value: 'plush_textiles', label: '봉제/섬유', emoji: '🧸' },
  { value: 'figures', label: '피규어', emoji: '🎭' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { addProject } = useProjectStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('general_goods');
  const [ipCharacter, setIpCharacter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('프로젝트 이름을 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          ipCharacter: ipCharacter.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로젝트 생성에 실패했습니다.');
      }

      addProject(data.data);
      toast.success('프로젝트가 생성되었습니다.');
      router.push(`/generate/${data.data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>새 프로젝트 만들기</CardTitle>
          <CardDescription>
            제품 목업 이미지 생성을 위한 새 프로젝트를 생성합니다
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">프로젝트 이름 *</Label>
              <Input
                id="name"
                placeholder="예: 카카오프렌즈 신제품"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="프로젝트에 대한 간단한 설명..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as CategoryType)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipCharacter">IP 캐릭터</Label>
              <Input
                id="ipCharacter"
                placeholder="예: 라이언, 어피치"
                value={ipCharacter}
                onChange={(e) => setIpCharacter(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                주로 사용할 IP 캐릭터가 있다면 입력해 주세요
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '생성 중...' : '프로젝트 생성'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
