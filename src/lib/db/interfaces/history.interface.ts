// 생성 이력 레포지토리 인터페이스
// 데이터베이스 교체 시 이 인터페이스만 구현하면 됨

import type { GenerationHistory, GenerationSettings, GenerationModeType } from '@/types';

export interface CreateHistoryDTO {
  projectId: string;
  mode: GenerationModeType;
  inputImages: string[];
  outputImages: string[];
  settings: GenerationSettings;
}

export interface IHistoryRepository {
  // 이력 조회
  findById(id: string): Promise<GenerationHistory | null>;
  findAllByProjectId(projectId: string): Promise<GenerationHistory[]>;
  findFavoritesByProjectId(projectId: string): Promise<GenerationHistory[]>;
  
  // 이력 생성
  create(data: CreateHistoryDTO): Promise<GenerationHistory>;
  
  // 즐겨찾기 토글
  toggleFavorite(id: string): Promise<GenerationHistory>;
  
  // 이력 삭제
  delete(id: string): Promise<void>;
  deleteAllByProjectId(projectId: string): Promise<void>;
}
