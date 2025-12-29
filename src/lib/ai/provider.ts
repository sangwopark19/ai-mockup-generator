// AI 모델 프로바이더 인터페이스
// AI 모델 교체 시 이 인터페이스만 구현하면 됨

import type { GenerationSettings } from '@/types';

export interface IAIModelProvider {
  // 프로바이더 이름
  readonly name: string;

  // 이미지 생성
  generateImages(
    prompt: string,
    settings: GenerationSettings,
    inputImages: string[], // base64 또는 URL
    count?: number
  ): Promise<string[]>; // base64 이미지 배열 반환

  // 인페인팅 (부분 편집)
  inpaint(
    image: string, // base64 또는 URL
    mask: string, // base64 마스크 이미지
    prompt: string
  ): Promise<string>; // base64 이미지 반환

  // 업스케일
  upscale(
    image: string, // base64 또는 URL
    targetResolution: number
  ): Promise<string>; // base64 이미지 반환
}
