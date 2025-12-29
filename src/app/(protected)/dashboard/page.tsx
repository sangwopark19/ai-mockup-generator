'use client';

// 대시보드 페이지

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectStore } from '@/stores/project-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCard } from '@/components/project/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, accessToken } = useAuthStore();
  const { projects, setProjects, removeProject, isLoading, setLoading } = useProjectStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!accessToken) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/projects', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data.data || []);
        }
      } catch (error) {
        console.error('프로젝트 로드 오류:', error);
        toast.error('프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    fetchProjects();
  }, [accessToken, setProjects, setLoading]);

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        removeProject(projectId);
        toast.success('프로젝트가 삭제되었습니다.');
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('프로젝트 삭제 오류:', error);
      toast.error('프로젝트 삭제에 실패했습니다.');
    }
  };

  const recentProjects = projects.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <div>
        <h1 className="text-3xl font-bold">
          안녕하세요, {user?.name}님! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          AI 목업 생성기에 오신 것을 환영합니다
        </p>
      </div>

      {/* 빠른 시작 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 border-pink-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🚀</span> 새 프로젝트
            </CardTitle>
            <CardDescription>
              새로운 제품 목업 프로젝트를 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/projects/new">
              <Button className="w-full">프로젝트 생성</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📁</span> 내 프로젝트
            </CardTitle>
            <CardDescription>
              총 {projects.length}개의 프로젝트
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/projects">
              <Button variant="outline" className="w-full">전체 보기</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💡</span> 사용 가이드
            </CardTitle>
            <CardDescription>
              AI 목업 생성기 사용 방법 알아보기
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              준비 중
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 최근 프로젝트 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">최근 프로젝트</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              전체 보기 →
            </Button>
          </Link>
        </div>

        {isLoading || !isInitialized ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <span className="text-4xl block mb-4">📂</span>
              <p>아직 프로젝트가 없습니다</p>
              <Link href="/projects/new" className="mt-4 inline-block">
                <Button>첫 프로젝트 만들기</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
