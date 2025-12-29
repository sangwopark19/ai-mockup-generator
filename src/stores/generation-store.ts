// 이미지 생성 상태 관리 스토어
// Zustand를 사용한 전역 상태 관리

import { create } from 'zustand';
import type { 
  GenerationSettings, 
  GenerationModeType, 
  GenerationHistory 
} from '@/types';

interface GenerationState {
  // 상태
  mode: GenerationModeType;
  settings: GenerationSettings;
  inputImages: File[];
  generatedImages: string[];
  selectedImage: string | null;
  isGenerating: boolean;
  progress: number;
  error: string | null;
  history: GenerationHistory[];

  // 액션
  setMode: (mode: GenerationModeType) => void;
  setSettings: (settings: Partial<GenerationSettings>) => void;
  setInputImages: (images: File[]) => void;
  addInputImage: (image: File) => void;
  removeInputImage: (index: number) => void;
  setGeneratedImages: (images: string[]) => void;
  setSelectedImage: (image: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setHistory: (history: GenerationHistory[]) => void;
  reset: () => void;
}

const initialSettings: GenerationSettings = {
  inputImages: [],
  material: undefined,
  color: undefined,
  viewpoint: undefined,
  priority: undefined,
  allowDeformation: false,
  transparentBackground: false,
};

export const useGenerationStore = create<GenerationState>()((set) => ({
  // 초기 상태
  mode: 'ip_replacement',
  settings: initialSettings,
  inputImages: [],
  generatedImages: [],
  selectedImage: null,
  isGenerating: false,
  progress: 0,
  error: null,
  history: [],

  // 모드 설정
  setMode: (mode) => set({ mode }),

  // 설정 업데이트
  setSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),

  // 입력 이미지 설정
  setInputImages: (images) => set({ inputImages: images }),

  // 입력 이미지 추가
  addInputImage: (image) =>
    set((state) => ({
      inputImages: [...state.inputImages, image],
    })),

  // 입력 이미지 제거
  removeInputImage: (index) =>
    set((state) => ({
      inputImages: state.inputImages.filter((_, i) => i !== index),
    })),

  // 생성된 이미지 설정
  setGeneratedImages: (images) =>
    set({
      generatedImages: images,
      isGenerating: false,
      progress: 100,
    }),

  // 선택된 이미지 설정
  setSelectedImage: (image) => set({ selectedImage: image }),

  // 생성 중 상태 설정
  setIsGenerating: (isGenerating) =>
    set({
      isGenerating,
      progress: isGenerating ? 0 : 100,
      error: null,
    }),

  // 진행률 설정
  setProgress: (progress) => set({ progress }),

  // 에러 설정
  setError: (error) =>
    set({
      error,
      isGenerating: false,
    }),

  // 이력 설정
  setHistory: (history) => set({ history }),

  // 초기화
  reset: () =>
    set({
      mode: 'ip_replacement',
      settings: initialSettings,
      inputImages: [],
      generatedImages: [],
      selectedImage: null,
      isGenerating: false,
      progress: 0,
      error: null,
    }),
}));
