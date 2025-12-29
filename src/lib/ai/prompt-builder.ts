// 프롬프트 빌더
// 생성 설정에 따른 프롬프트 구성

import type { GenerationSettings, GenerationModeType } from '@/types';

// 재질 매핑 (한국어 → 영어)
const materialMap: Record<string, string> = {
  plastic_glossy: 'glossy plastic',
  plastic_matte: 'matte plastic',
  plush_fabric: 'soft plush fabric',
  plush_fur: 'fluffy fur plush',
  ceramic: 'ceramic',
  porcelain: 'white porcelain',
  transparent_plastic: 'transparent clear plastic',
  transparent_glass: 'transparent glass',
};

// 시점 매핑 (한국어 → 영어)
const viewpointMap: Record<string, string> = {
  front: 'front view',
  three_quarter: 'three-quarter view',
  top: 'top-down view',
  bottom: 'bottom-up view',
  preview: 'product preview angle',
};

/**
 * 모드에 따른 베이스 프롬프트 생성
 */
function getBasePrompt(mode: GenerationModeType): string {
  switch (mode) {
    case 'ip_replacement':
      return `Create a photorealistic product mockup image. 
Replace the character/design on this product while maintaining the exact product structure, shape, and proportions. 
Keep the original product form intact. The new character should fit naturally on the product surface.`;

    case 'sketch_to_mockup':
      return `Transform this 2D design sketch into a photorealistic product mockup image. 
Preserve all design details, proportions, and artistic intent from the sketch. 
Generate a realistic 3D product representation that looks like a real manufactured item.`;

    case 'background_composite':
      return `Create a product mockup by compositing the character onto the product. 
The character should be naturally integrated onto the product surface. 
Maintain realistic lighting, shadows, and perspective matching.`;

    case 'history_based':
      return `Create a variation of this product mockup. 
Maintain the same product structure and style. 
Apply the new character/design while preserving the overall aesthetic.`;

    default:
      return 'Create a photorealistic product mockup image.';
  }
}

/**
 * 생성 설정에 따른 전체 프롬프트 빌드
 */
export function buildPrompt(
  mode: GenerationModeType,
  settings: GenerationSettings
): string {
  const parts: string[] = [];

  // 1. 베이스 프롬프트
  parts.push(getBasePrompt(mode));

  // 2. 재질 설정
  if (settings.material) {
    const materialName = materialMap[settings.material.type] || settings.material.type;
    parts.push(`Material: ${materialName}.`);
    
    if (settings.material.customDescription) {
      parts.push(`Material details: ${settings.material.customDescription}.`);
    }
  }

  // 3. 색상 설정
  if (settings.color) {
    if (settings.color.mode === 'from_character') {
      parts.push('Use colors extracted from the character image.');
    } else if (settings.color.customColor) {
      parts.push(`Apply custom color: ${settings.color.customColor}.`);
    }
  }

  // 4. 시점 설정
  if (settings.viewpoint) {
    const viewpointName = viewpointMap[settings.viewpoint] || settings.viewpoint;
    parts.push(`Camera angle: ${viewpointName}.`);
  }

  // 5. 우선순위 설정
  if (settings.priority === 'fix_structure') {
    parts.push('IMPORTANT: Maintain the exact physical structure and shape of the product. Structure preservation is the top priority.');
  } else if (settings.priority === 'copy_style') {
    parts.push('IMPORTANT: Copy the exact style and aesthetic of the reference. Style matching is the top priority.');
  }

  // 6. 변형 허용 여부
  if (!settings.allowDeformation) {
    parts.push('Do not distort or deform the character proportions or silhouette. Maintain original character shape.');
  }

  // 7. 투명 배경
  if (settings.transparentBackground) {
    parts.push('Generate the image with a transparent background (alpha channel). No background, only the product.');
  }

  // 8. 품질 설정
  parts.push('High quality, professional product photography, studio lighting, sharp details, 4K resolution.');

  return parts.join('\n');
}

/**
 * 인페인팅용 프롬프트 빌드
 */
export function buildInpaintPrompt(
  editType: 'material' | 'color' | 'shape' | 'add_detail',
  instruction: string
): string {
  const basePrompts: Record<string, string> = {
    material: 'Change the material of the selected area.',
    color: 'Change the color of the selected area.',
    shape: 'Modify the shape of the selected area.',
    add_detail: 'Add details to the selected area.',
  };

  return `${basePrompts[editType]} 
User instruction: ${instruction}
Maintain consistency with the rest of the image. 
Keep the same lighting and style.
High quality, seamless blending.`;
}
