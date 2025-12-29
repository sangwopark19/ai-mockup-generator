// 프로젝트 상태 관리 스토어
// Zustand를 사용한 전역 상태 관리

import { create } from 'zustand';
import type { Project } from '@/types';

interface ProjectState {
  // 상태
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
  // 초기 상태
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // 프로젝트 목록 설정
  setProjects: (projects) =>
    set({
      projects,
      isLoading: false,
      error: null,
    }),

  // 현재 프로젝트 설정
  setCurrentProject: (project) =>
    set({
      currentProject: project,
    }),

  // 프로젝트 추가
  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),

  // 프로젝트 수정
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),

  // 프로젝트 삭제
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject,
    })),

  // 로딩 상태 설정
  setLoading: (isLoading) => set({ isLoading }),

  // 에러 설정
  setError: (error) => set({ error, isLoading: false }),

  // 초기화
  clearProjects: () =>
    set({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,
    }),
}));
