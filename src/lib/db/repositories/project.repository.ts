// 프로젝트 레포지토리 Prisma 구현체
// AI 목업 이미지 생성 프로그램

import { prisma } from '../index';
import type { IProjectRepository } from '../interfaces/project.interface';
import type { Project, CreateProjectDTO, UpdateProjectDTO, CategoryType } from '@/types';

export class PrismaProjectRepository implements IProjectRepository {
  // 프로젝트 ID로 조회
  async findById(id: string): Promise<Project | null> {
    const project = await prisma.project.findUnique({
      where: { id, deletedAt: null },
    });
    
    if (!project) return null;
    
    return {
      ...project,
      category: project.category as CategoryType,
    };
  }

  // 사용자의 모든 프로젝트 조회
  async findAllByUserId(userId: string): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
    
    return projects.map(p => ({
      ...p,
      category: p.category as CategoryType,
    }));
  }

  // 프로젝트 생성
  async create(userId: string, data: CreateProjectDTO): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        category: data.category,
        ipCharacter: data.ipCharacter,
      },
    });
    
    return {
      ...project,
      category: project.category as CategoryType,
    };
  }

  // 프로젝트 수정
  async update(id: string, data: UpdateProjectDTO): Promise<Project> {
    const project = await prisma.project.update({
      where: { id },
      data,
    });
    
    return {
      ...project,
      category: project.category as CategoryType,
    };
  }

  // 프로젝트 영구 삭제
  async delete(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id },
    });
  }

  // 프로젝트 소프트 삭제
  async softDelete(id: string): Promise<void> {
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // 프로젝트 복원
  async restore(id: string): Promise<Project> {
    const project = await prisma.project.update({
      where: { id },
      data: { deletedAt: null },
    });
    
    return {
      ...project,
      category: project.category as CategoryType,
    };
  }

  // 소유권 확인
  async isOwner(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });
    
    return project?.userId === userId;
  }
}

// 싱글톤 인스턴스 내보내기
export const projectRepository = new PrismaProjectRepository();
