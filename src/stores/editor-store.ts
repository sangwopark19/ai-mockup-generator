// 에디터(인페인팅) 상태 관리 스토어
// Zustand를 사용한 전역 상태 관리

import { create } from 'zustand';
import type { EditType } from '@/types';

interface BrushSettings {
  size: number;
  opacity: number;
}

interface EditorState {
  // 상태
  originalImage: string | null;
  maskData: string | null;
  resultImage: string | null;
  editType: EditType;
  instruction: string;
  brushSettings: BrushSettings;
  isEditing: boolean;
  isProcessing: boolean;
  error: string | null;
  history: string[]; // 마스크 히스토리 (실행 취소용)
  historyIndex: number;

  // 액션
  setOriginalImage: (image: string | null) => void;
  setMaskData: (mask: string | null) => void;
  setResultImage: (image: string | null) => void;
  setEditType: (type: EditType) => void;
  setInstruction: (instruction: string) => void;
  setBrushSettings: (settings: Partial<BrushSettings>) => void;
  setIsEditing: (isEditing: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (mask: string) => void;
  undo: () => void;
  redo: () => void;
  clearMask: () => void;
  reset: () => void;
}

const initialBrushSettings: BrushSettings = {
  size: 20,
  opacity: 1,
};

export const useEditorStore = create<EditorState>()((set, get) => ({
  // 초기 상태
  originalImage: null,
  maskData: null,
  resultImage: null,
  editType: 'shape',
  instruction: '',
  brushSettings: initialBrushSettings,
  isEditing: false,
  isProcessing: false,
  error: null,
  history: [],
  historyIndex: -1,

  // 원본 이미지 설정
  setOriginalImage: (image) =>
    set({
      originalImage: image,
      maskData: null,
      resultImage: null,
      history: [],
      historyIndex: -1,
    }),

  // 마스크 데이터 설정
  setMaskData: (mask) => set({ maskData: mask }),

  // 결과 이미지 설정
  setResultImage: (image) => set({ resultImage: image }),

  // 편집 타입 설정
  setEditType: (type) => set({ editType: type }),

  // 지시사항 설정
  setInstruction: (instruction) => set({ instruction }),

  // 브러시 설정 업데이트
  setBrushSettings: (settings) =>
    set((state) => ({
      brushSettings: { ...state.brushSettings, ...settings },
    })),

  // 편집 중 상태 설정
  setIsEditing: (isEditing) => set({ isEditing }),

  // 처리 중 상태 설정
  setIsProcessing: (isProcessing) =>
    set({
      isProcessing,
      error: null,
    }),

  // 에러 설정
  setError: (error) =>
    set({
      error,
      isProcessing: false,
    }),

  // 히스토리에 추가 (실행 취소용)
  addToHistory: (mask) =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(mask);
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
        maskData: mask,
      };
    }),

  // 실행 취소
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        historyIndex: historyIndex - 1,
        maskData: history[historyIndex - 1],
      });
    } else if (historyIndex === 0) {
      set({
        historyIndex: -1,
        maskData: null,
      });
    }
  },

  // 다시 실행
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        historyIndex: historyIndex + 1,
        maskData: history[historyIndex + 1],
      });
    }
  },

  // 마스크 초기화
  clearMask: () =>
    set({
      maskData: null,
      history: [],
      historyIndex: -1,
    }),

  // 전체 초기화
  reset: () =>
    set({
      originalImage: null,
      maskData: null,
      resultImage: null,
      editType: 'shape',
      instruction: '',
      brushSettings: initialBrushSettings,
      isEditing: false,
      isProcessing: false,
      error: null,
      history: [],
      historyIndex: -1,
    }),
}));
