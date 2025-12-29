// 프로젝트 레포지토리 인터페이스
// 데이터베이스 교체 시 이 인터페이스만 구현하면 됨

import type { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types';

export interface IProjectRepository {
  // 프로젝트 조회
  findById(id: string): Promise<Project | null>;
  findAllByUserId(userId: string): Promise<Project[]>;
  
  // 프로젝트 생성
  create(userId: string, data: CreateProjectDTO): Promise<Project>;
  
  // 프로젝트 수정
  update(id: string, data: UpdateProjectDTO): Promise<Project>;
  
  // 프로젝트 삭제
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  
  // 프로젝트 복원
  restore(id: string): Promise<Project>;
  
  // 소유권 확인
  isOwner(projectId: string, userId: string): Promise<boolean>;
}
