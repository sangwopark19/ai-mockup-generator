// Gemini AI 프로바이더 구현
// Google Gemini 2.5 Flash Image 모델 사용
// 참고: https://ai.google.dev/gemini-api/docs/image-generation?hl=ko

import { GoogleGenAI } from '@google/genai';
import type { IAIModelProvider } from './provider';
import type { GenerationSettings, GenerationModeType } from '@/types';
import { buildPrompt, buildInpaintPrompt } from './prompt-builder';

export class GeminiProvider implements IAIModelProvider {
  readonly name = 'gemini-2.5-flash-image';
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_GEMINI_API_KEY;
    if (!key) {
      throw new Error('GOOGLE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    this.client = new GoogleGenAI({ apiKey: key });
    this.model = 'gemini-2.5-flash-image'; // 이미지 생성 지원 모델
  }

  /**
   * 이미지 생성
   * @param prompt - 생성 프롬프트 (또는 모드)
   * @param settings - 생성 설정
   * @param inputImages - 입력 이미지 (base64)
   * @param count - 생성할 이미지 수 (기본 1)
   * @returns base64 이미지 배열
   */
  async generateImages(
    prompt: string,
    settings: GenerationSettings,
    inputImages: string[],
    count: number = 1
  ): Promise<string[]> {
    const generatedImages: string[] = [];
    
    // 모드 추출 (prompt가 모드인 경우)
    const mode = (prompt as GenerationModeType) || 'ip_replacement';
    const fullPrompt = buildPrompt(mode, settings);


    // 입력 이미지 파트 준비
    const imageParts = inputImages.map((img) => {
      // base64 데이터에서 헤더 제거
      const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
      return {
        inlineData: {
          data: base64Data,
          mimeType: 'image/png',
        },
      };
    });

    // 콘텐츠 구성
    const contents = [
      { text: fullPrompt },
      ...imageParts,
    ];

    // 이미지 생성 (count 만큼 반복)
    for (let i = 0; i < count; i++) {
      try {
        const response = await this.client.models.generateContent({
          model: this.model,
          contents: contents,
          config: {
            responseModalities: ['Text', 'Image'],
          },
        });

        // 응답에서 이미지 추출
        if (response.candidates && response.candidates.length > 0) {
          const parts = response.candidates[0].content?.parts || [];
          for (const part of parts) {
            if (part.inlineData) {
              const imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              generatedImages.push(imageData);
              break; // 첫 번째 이미지만 사용
            }
          }
        }
      } catch (error) {
        console.error(`이미지 생성 오류 (${i + 1}/${count}):`, error);
      }
    }

    // 최소 1개 이미지가 없으면 에러
    if (generatedImages.length === 0) {
      throw new Error('이미지 생성에 실패했습니다. 다시 시도해 주세요.');
    }

    return generatedImages;
  }

  /**
   * 인페인팅 (부분 편집)
   */
  async inpaint(
    image: string,
    mask: string,
    prompt: string
  ): Promise<string> {
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
    const base64Mask = mask.replace(/^data:image\/\w+;base64,/, '');

    const inpaintPrompt = buildInpaintPrompt('shape', prompt);

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: [
        { text: `Inpaint the masked area of this image. ${inpaintPrompt}` },
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png',
          },
        },
        {
          inlineData: {
            data: base64Mask,
            mimeType: 'image/png',
          },
        },
      ],
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    // 응답에서 이미지 추출
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('인페인팅에 실패했습니다.');
  }

  /**
   * 업스케일 (Gemini는 직접 지원하지 않아 고해상도 재생성으로 대체)
   */
  async upscale(
    image: string,
    targetResolution: number
  ): Promise<string> {
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: [
        { 
          text: `Recreate this exact image at ${targetResolution}x${targetResolution} resolution. 
Maintain all details exactly as they are. High quality, sharp, professional.` 
        },
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png',
          },
        },
      ],
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    // 응답에서 이미지 추출
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('업스케일에 실패했습니다.');
  }
}
