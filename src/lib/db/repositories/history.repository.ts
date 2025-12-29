// 생성 이력 레포지토리 Prisma 구현체
// AI 목업 이미지 생성 프로그램

import { prisma } from '../index';
import type { IHistoryRepository, CreateHistoryDTO } from '../interfaces/history.interface';
import type { GenerationHistory, GenerationSettings, GenerationModeType } from '@/types';

export class PrismaHistoryRepository implements IHistoryRepository {
  // 이력 ID로 조회
  async findById(id: string): Promise<GenerationHistory | null> {
    const history = await prisma.generationHistory.findUnique({
      where: { id },
    });
    
    if (!history) return null;
    
    return {
      ...history,
      mode: history.mode as GenerationModeType,
      settings: history.settings as unknown as GenerationSettings,
    };
  }

  // 프로젝트의 모든 이력 조회
  async findAllByProjectId(projectId: string): Promise<GenerationHistory[]> {
    const histories = await prisma.generationHistory.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    
    return histories.map(h => ({
      ...h,
      mode: h.mode as GenerationModeType,
      settings: h.settings as unknown as GenerationSettings,
    }));
  }

  // 프로젝트의 즐겨찾기 이력 조회
  async findFavoritesByProjectId(projectId: string): Promise<GenerationHistory[]> {
    const histories = await prisma.generationHistory.findMany({
      where: { projectId, isFavorite: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return histories.map(h => ({
      ...h,
      mode: h.mode as GenerationModeType,
      settings: h.settings as unknown as GenerationSettings,
    }));
  }

  // 이력 생성
  async create(data: CreateHistoryDTO): Promise<GenerationHistory> {
    const history = await prisma.generationHistory.create({
      data: {
        projectId: data.projectId,
        mode: data.mode,
        inputImages: data.inputImages,
        outputImages: data.outputImages,
        settings: data.settings as object,
      },
    });
    
    return {
      ...history,
      mode: history.mode as GenerationModeType,
      settings: history.settings as unknown as GenerationSettings,
    };
  }

  // 즐겨찾기 토글
  async toggleFavorite(id: string): Promise<GenerationHistory> {
    const current = await prisma.generationHistory.findUnique({
      where: { id },
      select: { isFavorite: true },
    });
    
    const history = await prisma.generationHistory.update({
      where: { id },
      data: { isFavorite: !current?.isFavorite },
    });
    
    return {
      ...history,
      mode: history.mode as GenerationModeType,
      settings: history.settings as unknown as GenerationSettings,
    };
  }

  // 이력 삭제
  async delete(id: string): Promise<void> {
    await prisma.generationHistory.delete({
      where: { id },
    });
  }

  // 프로젝트의 모든 이력 삭제
  async deleteAllByProjectId(projectId: string): Promise<void> {
    await prisma.generationHistory.deleteMany({
      where: { projectId },
    });
  }
}

// 싱글톤 인스턴스 내보내기
export const historyRepository = new PrismaHistoryRepository();
