/**
 * 프롬프트 빌더 테스트
 * Gemini 2.5 Flash Image 최적화 프롬프트 생성 로직 검증
 */

import { describe, test, expect } from 'vitest';
import { buildPrompt, buildInpaintPrompt } from '@/lib/ai/prompt-builder';
import type { GenerationSettings, GenerationModeType } from '@/types';

describe('프롬프트 빌더 테스트', () => {
  // 각 테스트 후 콘솔에 로그 출력
  const logPrompt = (description: string, prompt: string) => {
    console.log('\n========================================');
    console.log(`📝 테스트: ${description}`);
    console.log('========================================');
    console.log('생성된 프롬프트:');
    console.log(prompt);
    console.log('========================================\n');
  };

  describe('buildPrompt - 모드별 기본 프롬프트', () => {
    const baseSettings: GenerationSettings = {
      inputImages: ['test-image.png'],
    };

    test('IP 교체 모드 기본 프롬프트 생성', () => {
      const mode: GenerationModeType = 'ip_replacement';
      const prompt = buildPrompt(mode, baseSettings);

      logPrompt('IP 교체 모드 기본', prompt);

      // 새로운 구조 검증
      expect(prompt).toContain('[TASK INSTRUCTION]');
      expect(prompt).toContain('[PRODUCT PRESERVATION - CRITICAL]');
      expect(prompt).toContain('[CHARACTER APPLICATION]');
      expect(prompt).toContain('[QUALITY REQUIREMENTS]');
      expect(prompt).toContain('IP (Intellectual Property) character replacement');
      expect(prompt).toContain('COMPLETELY UNCHANGED');
    });

    test('스케치→목업 모드 기본 프롬프트 생성', () => {
      const mode: GenerationModeType = 'sketch_to_mockup';
      const prompt = buildPrompt(mode, baseSettings);

      logPrompt('스케치→목업 모드 기본', prompt);

      expect(prompt).toContain('[TASK INSTRUCTION]');
      expect(prompt).toContain('Transform this 2D design sketch');
      expect(prompt).toContain('[DESIGN INTERPRETATION]');
      expect(prompt).toContain('[PRODUCT REALIZATION]');
      expect(prompt).toContain('[PHOTOREALISTIC RENDERING]');
    });

    test('배경 합성 모드 기본 프롬프트 생성', () => {
      const mode: GenerationModeType = 'background_composite';
      const prompt = buildPrompt(mode, baseSettings);

      logPrompt('배경 합성 모드 기본', prompt);

      expect(prompt).toContain('[TASK INSTRUCTION]');
      expect(prompt).toContain('[PRODUCT PRESERVATION - from Image 1]');
      expect(prompt).toContain('[CHARACTER INTEGRATION - from Image 2]');
      expect(prompt).toContain('factory-original');
    });

    test('히스토리 기반 모드 기본 프롬프트 생성', () => {
      const mode: GenerationModeType = 'history_based';
      const prompt = buildPrompt(mode, baseSettings);

      logPrompt('히스토리 기반 모드 기본', prompt);

      expect(prompt).toContain('[TASK INSTRUCTION]');
      expect(prompt).toContain('[PRESERVE EXACTLY FROM PREVIOUS RESULT]');
      expect(prompt).toContain('[CHANGE ONLY]');
      expect(prompt).toContain('[CONSISTENCY REQUIREMENTS]');
      expect(prompt).toContain('same product line');
    });
  });

  describe('buildPrompt - 재질 옵션', () => {
    test('플라스틱 광택 재질 옵션 포함', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        material: {
          type: 'plastic_glossy',
        },
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('플라스틱 광택 재질', prompt);

      expect(prompt).toContain('[MATERIAL SPECIFICATION]');
      expect(prompt).toContain('Glossy injection-molded plastic');
      expect(prompt).toContain('high shine');
    });

    test('봉제 털 재질 + 커스텀 설명 포함', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        material: {
          type: 'plush_fur',
          customDescription: '부드럽고 촉감이 좋은 고급 털',
        },
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('봉제 털 재질 + 커스텀 설명', prompt);

      expect(prompt).toContain('Fluffy, long fur texture');
      expect(prompt).toContain('부드럽고 촉감이 좋은 고급 털');
    });

    test('투명 유리 재질 옵션 포함', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        material: {
          type: 'transparent_glass',
        },
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('투명 유리 재질', prompt);

      expect(prompt).toContain('Crystal-clear glass transparency');
      expect(prompt).toContain('refraction');
    });

    test('세라믹 재질 옵션 포함', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        material: {
          type: 'ceramic',
        },
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('세라믹 재질', prompt);

      expect(prompt).toContain('ceramic glaze finish');
      expect(prompt).toContain('kiln-fired');
    });
  });

  describe('buildPrompt - 색상 옵션', () => {
    test('캐릭터 색상 사용 옵션', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        color: {
          mode: 'from_character',
        },
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('캐릭터 색상 사용', prompt);

      expect(prompt).toContain('[COLOR APPLICATION]');
      expect(prompt).toContain('Extract the primary and secondary colors');
      expect(prompt).toContain('character reference image');
    });

    test('커스텀 색상 옵션', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        color: {
          mode: 'custom',
          customColor: '#FF5733',
        },
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('커스텀 색상 #FF5733', prompt);

      expect(prompt).toContain('[COLOR APPLICATION]');
      expect(prompt).toContain('#FF5733');
      expect(prompt).toContain('manufactured in this color');
    });
  });

  describe('buildPrompt - 시점 옵션', () => {
    const viewpoints = [
      { value: 'front', expected: 'directly in front of the product' },
      { value: 'three_quarter', expected: 'three-quarter angle' },
      { value: 'top', expected: 'directly above the product' },
      { value: 'bottom', expected: 'below the product' },
      { value: 'preview', expected: 'Classic product preview angle' },
    ] as const;

    viewpoints.forEach(({ value, expected }) => {
      test(`${value} 시점 옵션 포함`, () => {
        const settings: GenerationSettings = {
          inputImages: ['test.png'],
          viewpoint: value,
        };

        const prompt = buildPrompt('ip_replacement', settings);
        logPrompt(`${value} 시점`, prompt);

        expect(prompt).toContain('[CAMERA ANGLE]');
        expect(prompt).toContain(expected);
      });
    });
  });

  describe('buildPrompt - 우선순위 옵션', () => {
    test('구조 고정 우선순위', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        priority: 'fix_structure',
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('구조 고정 우선순위', prompt);

      expect(prompt).toContain('[PRIORITY INSTRUCTION - STRUCTURE PRESERVATION]');
      expect(prompt).toContain('HIERARCHY OF PRESERVATION');
      expect(prompt).toContain('NEVER change under any circumstances');
    });

    test('스타일 복사 우선순위', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        priority: 'copy_style',
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('스타일 복사 우선순위', prompt);

      expect(prompt).toContain('[PRIORITY INSTRUCTION - STYLE MATCHING]');
      expect(prompt).toContain('HIERARCHY OF PRESERVATION');
      expect(prompt).toContain('Character style and aesthetic');
    });
  });

  describe('buildPrompt - 추가 옵션', () => {
    test('변형 불허용 옵션 (기본값)', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        allowDeformation: false,
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('변형 불허용', prompt);

      expect(prompt).toContain('[DEFORMATION CONTROL]');
      expect(prompt).toContain('proportions and silhouette must remain recognizable');
    });

    test('변형 허용 옵션', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        allowDeformation: true,
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('변형 허용', prompt);

      // 변형 허용 시 DEFORMATION CONTROL 섹션이 없어야 함
      expect(prompt).not.toContain('[DEFORMATION CONTROL]');
    });

    test('투명 배경 옵션', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        transparentBackground: true,
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('투명 배경', prompt);

      expect(prompt).toContain('[BACKGROUND SPECIFICATION]');
      expect(prompt).toContain('transparent background');
      expect(prompt).toContain('alpha channel');
    });
  });

  describe('buildPrompt - 복합 옵션', () => {
    test('모든 옵션 조합 테스트', () => {
      const settings: GenerationSettings = {
        inputImages: ['test.png'],
        material: {
          type: 'ceramic',
          customDescription: '매끄러운 표면',
        },
        color: {
          mode: 'custom',
          customColor: '#3498DB',
        },
        viewpoint: 'three_quarter',
        priority: 'fix_structure',
        allowDeformation: false,
        transparentBackground: true,
      };

      const prompt = buildPrompt('ip_replacement', settings);
      logPrompt('모든 옵션 조합', prompt);

      // 모든 옵션이 포함되었는지 검증
      expect(prompt).toContain('[MATERIAL SPECIFICATION]');
      expect(prompt).toContain('ceramic');
      expect(prompt).toContain('매끄러운 표면');
      expect(prompt).toContain('#3498DB');
      expect(prompt).toContain('three-quarter angle');
      expect(prompt).toContain('[PRIORITY INSTRUCTION - STRUCTURE PRESERVATION]');
      expect(prompt).toContain('[DEFORMATION CONTROL]');
      expect(prompt).toContain('[BACKGROUND SPECIFICATION]');
    });
  });

  describe('buildInpaintPrompt - 인페인팅 프롬프트', () => {
    const editTypes = [
      { type: 'material', instruction: '메탈릭 재질로 변경', expected: 'material of the selected masked area' },
      { type: 'color', instruction: '빨간색으로 변경', expected: 'color of the selected masked area' },
      { type: 'shape', instruction: '손잡이를 더 둥글게', expected: 'shape of the selected masked area' },
      { type: 'add_detail', instruction: '로고 추가', expected: 'Add the specified detail' },
    ] as const;

    editTypes.forEach(({ type, instruction, expected }) => {
      test(`${type} 인페인팅 프롬프트 생성`, () => {
        const prompt = buildInpaintPrompt(type, instruction);
        logPrompt(`인페인팅 - ${type}: ${instruction}`, prompt);

        expect(prompt).toContain('[INPAINTING TASK]');
        expect(prompt).toContain(expected);
        expect(prompt).toContain(instruction);
        expect(prompt).toContain('[USER INSTRUCTION]');
        expect(prompt).toContain('[INTEGRATION REQUIREMENTS]');
        expect(prompt).toContain('seamless');
      });
    });
  });
});
