'use client';

// 프로젝트 목록 페이지

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectStore } from '@/stores/project-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/project/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const { accessToken } = useAuthStore();
  const { projects, setProjects, removeProject, isLoading, setLoading } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 프로젝트</h1>
          <p className="text-muted-foreground">
            총 {projects.length}개의 프로젝트
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            + 새 프로젝트
          </Button>
        </Link>
      </div>

      {/* 검색 */}
      <div className="max-w-md">
        <Input
          placeholder="프로젝트 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 프로젝트 그리드 */}
      {isLoading || !isInitialized ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <span className="text-4xl block mb-4">🔍</span>
            <p>&quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다</p>
          </div>
        </Card>
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
  );
}
