// AI 프로바이더 팩토리
// 환경 변수에 따라 적절한 프로바이더 반환

import type { IAIModelProvider } from './provider';
import { GeminiProvider } from './gemini';

// AI 프로바이더 팩토리 함수
function createAIProvider(): IAIModelProvider {
  const model = process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL || 'gemini-2.5-flash-image';

  switch (model) {
    case 'gemini-2.5-flash-image':
    // case 'gemini-2.5-pro':
      return new GeminiProvider();
    // 향후 추가 가능:
    // case 'dall-e-3':
    //   return new DallE3Provider();
    // case 'stable-diffusion':
    //   return new StableDiffusionProvider();
    // case 'midjourney':
    //   return new MidjourneyProvider();
    default:
      console.warn(`알 수 없는 AI 모델: ${model}, Gemini 사용`);
      return new GeminiProvider();
  }
}

// AI 프로바이더 인스턴스 내보내기
export const aiProvider = createAIProvider();

// 타입도 내보내기
export type { IAIModelProvider } from './provider';
export { buildPrompt, buildInpaintPrompt } from './prompt-builder';
