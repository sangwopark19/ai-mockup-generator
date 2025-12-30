'use client';

// 프로젝트 상세 페이지
// 프로젝트 정보 및 생성 히스토리 표시

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Project, GenerationHistory } from '@/types';

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

const modeLabels: Record<string, string> = {
  ip_replacement: 'IP 교체',
  sketch_to_mockup: '스케치→목업',
  background_composite: '배경 합성',
  history_based: '히스토리 기반',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { accessToken } = useAuthStore();

  const [project, setProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!accessToken || !projectId) return;

      setIsLoading(true);
      try {
        // 프로젝트 정보 조회
        const projectResponse = await fetch(`/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProject(projectData.data);
        } else if (projectResponse.status === 404) {
          toast.error('프로젝트를 찾을 수 없습니다.');
          router.push('/projects');
          return;
        }

        // 생성 히스토리 조회 (프로젝트 API에 포함되어 있다고 가정)
        // TODO: 별도의 히스토리 API 구현 시 수정 필요
      } catch (error) {
        console.error('프로젝트 로드 오류:', error);
        toast.error('프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [accessToken, projectId, router]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까? 모든 생성 기록도 함께 삭제됩니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        toast.success('프로젝트가 삭제되었습니다.');
        router.push('/projects');
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('프로젝트 삭제 오류:', error);
      toast.error('프로젝트 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <span className="text-6xl mb-4">📂</span>
        <h2 className="text-xl font-semibold mb-2">프로젝트를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">
          프로젝트가 삭제되었거나 존재하지 않습니다.
        </p>
        <Link href="/projects">
          <Button>프로젝트 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/projects" className="text-muted-foreground hover:text-foreground">
              ← 프로젝트 목록
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-1">
            {project.description || '설명 없음'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/generate/${projectId}`}>
            <Button>
              🎨 이미지 생성
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </div>

      {/* 프로젝트 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">카테고리</p>
            <Badge
              variant="secondary"
              className={`${categoryColors[project.category]} text-white mt-1`}
            >
              {categoryLabels[project.category]}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">IP 캐릭터</p>
            <p className="font-medium mt-1">
              {project.ipCharacter || '미지정'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">생성일</p>
            <p className="font-medium mt-1">{formatDate(project.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">최근 수정</p>
            <p className="font-medium mt-1">{formatDate(project.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* 생성 히스토리 */}
      <Card>
        <CardHeader>
          <CardTitle>생성 히스토리</CardTitle>
          <CardDescription>
            이 프로젝트에서 생성한 이미지 기록
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    {item.outputImages && item.outputImages.length > 0 ? (
                      <img
                        src={item.outputImages[0]}
                        alt="생성된 이미지"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <Badge variant="outline" className="mb-2">
                      {modeLabels[item.mode] || item.mode}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl block mb-4">🎨</span>
              <p className="text-muted-foreground mb-4">
                아직 생성된 이미지가 없습니다
              </p>
              <Link href={`/generate/${projectId}`}>
                <Button>첫 이미지 생성하기</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 빠른 작업 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🔄</span> IP 교체
            </CardTitle>
            <CardDescription>
              기존 제품에 새 캐릭터 적용
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/generate/${projectId}?mode=ip_replacement`}>
              <Button variant="outline" className="w-full">시작하기</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>✏️</span> 스케치→목업
            </CardTitle>
            <CardDescription>
              스케치를 사실적인 제품으로
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/generate/${projectId}?mode=sketch_to_mockup`}>
              <Button variant="outline" className="w-full">시작하기</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🖼️</span> 배경 합성
            </CardTitle>
            <CardDescription>
              캐릭터를 제품에 합성
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/generate/${projectId}?mode=background_composite`}>
              <Button variant="outline" className="w-full">시작하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
