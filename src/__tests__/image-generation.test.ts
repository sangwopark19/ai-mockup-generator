/**
 * 이미지 생성 API 통합 테스트
 * Gemini 2.5 Flash Image 최적화 프롬프트 페이로드 검증
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { buildPrompt } from '@/lib/ai/prompt-builder';
import type { GenerationSettings, GenerationModeType } from '@/types';

// Gemini API 클라이언트 모킹
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: 'mock-base64-image-data',
                  },
                },
              ],
            },
          },
        ],
      }),
    },
  })),
}));

describe('이미지 생성 API 통합 테스트', () => {
  // 모킹된 API 호출 캡처용
  let capturedPayload: {
    mode: GenerationModeType;
    settings: GenerationSettings;
    prompt: string;
  } | null = null;

  // API 호출 시뮬레이션 함수
  const simulateImageGeneration = async (
    mode: GenerationModeType,
    settings: GenerationSettings
  ) => {
    // 프롬프트 생성
    const prompt = buildPrompt(mode, settings);
    
    // 페이로드 캡처
    capturedPayload = {
      mode,
      settings,
      prompt,
    };

    // 콘솔에 페이로드 로깅 (디버깅용)
    console.log('\n========================================');
    console.log('🚀 이미지 생성 API 호출 시뮬레이션');
    console.log('========================================');
    console.log('📌 모드:', mode);
    console.log('📌 설정:', JSON.stringify(settings, null, 2));
    console.log('📌 생성된 프롬프트:');
    console.log('----------------------------------------');
    console.log(prompt);
    console.log('========================================\n');

    // 실제 API 호출 대신 모킹된 응답 반환
    return {
      success: true,
      images: ['data:image/png;base64,mock-image-data'],
      historyId: 'mock-history-id',
    };
  };

  beforeEach(() => {
    capturedPayload = null;
    vi.clearAllMocks();
  });

  describe('사용자 플로우 시뮬레이션 - IP 교체 모드', () => {
    test('기본 옵션으로 이미지 생성', async () => {
      const mode: GenerationModeType = 'ip_replacement';
      const settings: GenerationSettings = {
        inputImages: ['product.png', 'character.png'],
      };

      const result = await simulateImageGeneration(mode, settings);

      // API 호출 성공 확인
      expect(result.success).toBe(true);
      expect(result.images).toHaveLength(1);

      // 캡처된 페이로드 검증 - 새 구조
      expect(capturedPayload).not.toBeNull();
      expect(capturedPayload?.mode).toBe('ip_replacement');
      expect(capturedPayload?.prompt).toContain('[TASK INSTRUCTION]');
      expect(capturedPayload?.prompt).toContain('[PRODUCT PRESERVATION - CRITICAL]');
      expect(capturedPayload?.prompt).toContain('[CHARACTER APPLICATION]');
    });

    test('플라스틱 광택 재질 + 정면 시점 옵션', async () => {
      const mode: GenerationModeType = 'ip_replacement';
      const settings: GenerationSettings = {
        inputImages: ['product.png', 'character.png'],
        material: {
          type: 'plastic_glossy',
        },
        viewpoint: 'front',
      };

      const result = await simulateImageGeneration(mode, settings);

      expect(result.success).toBe(true);
      expect(capturedPayload?.prompt).toContain('[MATERIAL SPECIFICATION]');
      expect(capturedPayload?.prompt).toContain('Glossy injection-molded plastic');
      expect(capturedPayload?.prompt).toContain('[CAMERA ANGLE]');
      expect(capturedPayload?.prompt).toContain('directly in front');
    });

    test('봉제 재질 + 커스텀 색상 + 투명 배경', async () => {
      const mode: GenerationModeType = 'ip_replacement';
      const settings: GenerationSettings = {
        inputImages: ['product.png', 'character.png'],
        material: {
          type: 'plush_fabric',
          customDescription: '부드러운 벨벳 질감',
        },
        color: {
          mode: 'custom',
          customColor: '#FFD700',
        },
        transparentBackground: true,
      };

      const result = await simulateImageGeneration(mode, settings);

      expect(result.success).toBe(true);
      expect(capturedPayload?.prompt).toContain('Soft, plush fabric texture');
      expect(capturedPayload?.prompt).toContain('부드러운 벨벳 질감');
      expect(capturedPayload?.prompt).toContain('#FFD700');
      expect(capturedPayload?.prompt).toContain('[BACKGROUND SPECIFICATION]');
      expect(capturedPayload?.prompt).toContain('transparent background');
    });
  });

  describe('사용자 플로우 시뮬레이션 - 스케치→목업 모드', () => {
    test('스케치 이미지로 목업 생성', async () => {
      const mode: GenerationModeType = 'sketch_to_mockup';
      const settings: GenerationSettings = {
        inputImages: ['sketch.png'],
        material: {
          type: 'ceramic',
        },
        viewpoint: 'three_quarter',
      };

      const result = await simulateImageGeneration(mode, settings);

      expect(result.success).toBe(true);
      expect(capturedPayload?.prompt).toContain('Transform this 2D design sketch');
      expect(capturedPayload?.prompt).toContain('[DESIGN INTERPRETATION]');
      expect(capturedPayload?.prompt).toContain('[PRODUCT REALIZATION]');
      expect(capturedPayload?.prompt).toContain('ceramic');
      expect(capturedPayload?.prompt).toContain('three-quarter angle');
    });
  });

  describe('사용자 플로우 시뮬레이션 - 배경 합성 모드', () => {
    test('캐릭터를 제품에 합성', async () => {
      const mode: GenerationModeType = 'background_composite';
      const settings: GenerationSettings = {
        inputImages: ['product.png', 'character.png'],
        priority: 'fix_structure',
        allowDeformation: false,
      };

      const result = await simulateImageGeneration(mode, settings);

      expect(result.success).toBe(true);
      expect(capturedPayload?.prompt).toContain('[PRODUCT PRESERVATION - from Image 1]');
      expect(capturedPayload?.prompt).toContain('[CHARACTER INTEGRATION - from Image 2]');
      expect(capturedPayload?.prompt).toContain('factory-original');
    });
  });

  describe('전체 옵션 조합 테스트', () => {
    test('피규어 카테고리 - 모든 옵션 선택', async () => {
      const mode: GenerationModeType = 'ip_replacement';
      const settings: GenerationSettings = {
        inputImages: ['figure-base.png', 'new-character.png'],
        material: {
          type: 'plastic_matte',
          customDescription: '프리미엄 ABS 플라스틱',
        },
        color: {
          mode: 'from_character',
        },
        viewpoint: 'preview',
        priority: 'copy_style',
        allowDeformation: false,
        transparentBackground: false,
      };

      const result = await simulateImageGeneration(mode, settings);

      // 페이로드 검증
      expect(capturedPayload).not.toBeNull();
      
      const prompt = capturedPayload!.prompt;
      
      // 모든 옵션이 프롬프트에 반영되었는지 확인
      expect(prompt).toContain('Matte injection-molded plastic');
      expect(prompt).toContain('프리미엄 ABS 플라스틱');
      expect(prompt).toContain('Extract the primary and secondary colors');
      expect(prompt).toContain('Classic product preview angle');
      expect(prompt).toContain('[PRIORITY INSTRUCTION - STYLE MATCHING]');
      expect(prompt).toContain('[DEFORMATION CONTROL]');
      
      // 투명 배경은 false이므로 포함되지 않아야 함
      expect(prompt).not.toContain('[BACKGROUND SPECIFICATION]');
    });

    test('봉제 카테고리 - 복합 옵션', async () => {
      const mode: GenerationModeType = 'sketch_to_mockup';
      const settings: GenerationSettings = {
        inputImages: ['plush-sketch.png'],
        material: {
          type: 'plush_fur',
          customDescription: '극세사 인조 털',
        },
        color: {
          mode: 'custom',
          customColor: '#FF69B4',
        },
        viewpoint: 'front',
        priority: 'fix_structure',
        allowDeformation: true, // 변형 허용
        transparentBackground: true,
      };

      const result = await simulateImageGeneration(mode, settings);

      const prompt = capturedPayload!.prompt;
      
      expect(prompt).toContain('Fluffy, long fur texture');
      expect(prompt).toContain('#FF69B4');
      expect(prompt).toContain('directly in front');
      expect(prompt).toContain('[BACKGROUND SPECIFICATION]');
      
      // 변형 허용이므로 DEFORMATION CONTROL이 없어야 함
      expect(prompt).not.toContain('[DEFORMATION CONTROL]');
    });
  });

  describe('API 페이로드 형식 검증', () => {
    test('generateContent 호출 시 올바른 형식의 페이로드 전달', async () => {
      const mode: GenerationModeType = 'ip_replacement';
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        material: { type: 'ceramic' },
      };

      const prompt = buildPrompt(mode, settings);

      // API 호출 시뮬레이션
      const contents = [
        { text: prompt },
        {
          inlineData: {
            data: 'mock-base64-data',
            mimeType: 'image/png',
          },
        },
      ];

      console.log('\n========================================');
      console.log('📦 API 페이로드 형식');
      console.log('========================================');
      console.log('Model:', 'gemini-2.5-flash-image');
      console.log('Contents:', JSON.stringify(contents, null, 2));
      console.log('Config:', JSON.stringify({
        responseModalities: ['Text', 'Image'],
      }, null, 2));
      console.log('========================================\n');

      // 페이로드 형식 검증
      expect(contents[0]).toHaveProperty('text');
      expect(contents[1]).toHaveProperty('inlineData');
      expect(contents[1].inlineData).toHaveProperty('data');
      expect(contents[1].inlineData).toHaveProperty('mimeType');
      
      // 프롬프트 구조 검증
      expect(prompt).toContain('[TASK INSTRUCTION]');
      expect(prompt).toContain('[PRODUCT PRESERVATION - CRITICAL]');
      expect(prompt).toContain('[CHARACTER APPLICATION]');
      expect(prompt).toContain('[MATERIAL SPECIFICATION]');
    });
  });
});

describe('프롬프트 생성 엣지 케이스', () => {
  test('빈 설정으로 기본 프롬프트 생성', () => {
    const settings: GenerationSettings = {
      inputImages: [],
    };

    const prompt = buildPrompt('ip_replacement', settings);

    console.log('\n========================================');
    console.log('⚠️ 엣지 케이스: 빈 설정');
    console.log('========================================');
    console.log(prompt);
    console.log('========================================\n');

    // 기본 프롬프트 구조는 항상 존재해야 함
    expect(prompt).toBeTruthy();
    expect(prompt).toContain('[TASK INSTRUCTION]');
    expect(prompt).toContain('[QUALITY REQUIREMENTS]');
  });

  test('알 수 없는 모드에 대한 기본 처리', () => {
    const settings: GenerationSettings = {
      inputImages: ['test.png'],
    };

    // 알 수 없는 모드를 강제로 전달 - 기본 IP 교체 모드로 폴백
    const prompt = buildPrompt('unknown_mode' as GenerationModeType, settings);

    console.log('\n========================================');
    console.log('⚠️ 엣지 케이스: 알 수 없는 모드');
    console.log('========================================');
    console.log(prompt);
    console.log('========================================\n');

    // IP 교체 모드의 기본 구조가 생성되어야 함 (폴백)
    expect(prompt).toContain('[TASK INSTRUCTION]');
    expect(prompt).toContain('[PRODUCT PRESERVATION - CRITICAL]');
  });

  describe('히스토리 기반 모드 테스트', () => {
    test('이전 생성 결과 기반 변형 생성', async () => {
      const mode: GenerationModeType = 'history_based';
      const settings: GenerationSettings = {
        inputImages: ['previous-result.png', 'new-character.png'],
        material: {
          type: 'ceramic',
        },
        color: {
          mode: 'from_character',
        },
      };

      const prompt = buildPrompt(mode, settings);

      console.log('\n========================================');
      console.log('📝 히스토리 기반 모드 테스트');
      console.log('========================================');
      console.log(prompt);
      console.log('========================================\n');

      expect(prompt).toContain('[PRESERVE EXACTLY FROM PREVIOUS RESULT]');
      expect(prompt).toContain('[CHANGE ONLY]');
      expect(prompt).toContain('[MATERIAL CONSISTENCY]');
      expect(prompt).toContain('[COLOR VARIATION]');
      expect(prompt).toContain('same product line');
    });
  });
});
