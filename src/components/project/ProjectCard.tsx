'use client';

// 프로젝트 카드 컴포넌트

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  general_goods: '일반 상품',
  plush_textiles: '봉제/섬유',
  figures: '피규어',
};

const categoryColors: Record<string, string> = {
  general_goods: 'bg-blue-500',
  plush_textiles: 'bg-pink-500',
  figures: 'bg-purple-500',
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription>
              {project.description || '설명 없음'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                열기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/generate/${project.id}`)}
              >
                이미지 생성
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(project.id)}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`${categoryColors[project.category]} text-white`}
          >
            {categoryLabels[project.category]}
          </Badge>
          {project.ipCharacter && (
            <Badge variant="outline">{project.ipCharacter}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <span>생성: {formatDate(project.createdAt)}</span>
        <span>수정: {formatDate(project.updatedAt)}</span>
      </CardFooter>
    </Card>
  );
}
