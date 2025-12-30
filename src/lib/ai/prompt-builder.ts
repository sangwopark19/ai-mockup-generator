// 프롬프트 빌더
// Gemini 2.5 Flash Image 최적화 프롬프트 구성
// gemini_prompt_optimization_guide.md 기반

import type { GenerationSettings, GenerationModeType } from '@/types';

// 재질별 상세 렌더링 요구사항
const materialRenderingRequirements: Record<string, string> = {
  plastic_glossy: `Material rendering requirements:
- Glossy injection-molded plastic finish with high shine
- Sharp, precise edges from professional mold manufacturing
- Bright surface reflections showing studio lighting setup
- Consistent color with slight material depth and clarity
- Clean seam lines typical of commercial plastic products`,

  plastic_matte: `Material rendering requirements:
- Matte injection-molded plastic finish with soft, non-reflective surface
- Sharp, precise edges from professional mold manufacturing
- Subtle light absorption characteristic of matte plastics
- Even color distribution without glossy highlights
- Professional manufacturing quality appearance`,

  plush_fabric: `Material rendering requirements:
- Soft, plush fabric texture with visible fiber detail
- Short fur texture with natural fabric weave
- Realistic fabric creases and folds at joints and bends
- Soft shadows characteristic of fabric materials
- No hard edges - all contours should appear soft and huggable`,

  plush_fur: `Material rendering requirements:
- Fluffy, long fur texture with individual hair strands visible
- Natural fur direction and flow following the product's form
- Soft, diffused shadows characteristic of furry materials
- Plush, stuffed appearance with visible texture depth
- Warm, tactile quality that invites touch`,

  ceramic: `Material rendering requirements:
- Smooth, glossy ceramic glaze finish with professional quality
- Subtle surface reflections showing studio lights as soft highlights
- Clean, crisp edges typical of kiln-fired molded ceramics
- Even color application throughout the entire surface
- Slight depth and translucency in the glaze finish`,

  porcelain: `Material rendering requirements:
- Fine white porcelain with delicate, translucent quality
- Smooth, refined surface with subtle luminosity
- Precise, elegant edges characteristic of high-quality porcelain
- Gentle light transmission creating a soft glow effect
- Premium, museum-quality appearance and craftsmanship`,

  transparent_plastic: `Material rendering requirements:
- Accurate light transmission and subtle refraction effects
- Visible internal elements through transparent areas
- Appropriate caustic effects and light play on surfaces
- Clear distinction between transparent and opaque areas
- Realistic clear plastic transparency with slight color tint`,

  transparent_glass: `Material rendering requirements:
- Crystal-clear glass transparency with accurate refraction
- Visible internal structures through glass walls
- Beautiful caustic effects and rainbow light dispersion
- Sharp, precise edges typical of molded or blown glass
- Premium glass quality with professional finish`,
};

// 시점별 상세 설명
const viewpointDescriptions: Record<string, string> = {
  front: 'Camera positioned directly in front of the product, capturing the full face and frontal details at eye level.',
  three_quarter: 'Camera positioned at a three-quarter angle (approximately 45 degrees), showing both the front and side of the product for a dynamic, dimensional view.',
  top: 'Camera positioned directly above the product, capturing a bird\'s-eye view that shows the top surface and overall shape from above.',
  bottom: 'Camera positioned below the product, looking upward to capture the underside and base details.',
  preview: 'Classic product preview angle commonly used in e-commerce, positioned slightly above and to the side for an inviting, commercial presentation.',
};

/**
 * IP 교체 모드 (캐릭터 교체) - 가장 중요한 모드
 */
function buildIPReplacementPrompt(settings: GenerationSettings): string {
  const sections: string[] = [];

  // 작업 지시
  sections.push(`[TASK INSTRUCTION]
Create a new professional product photograph by combining the elements from the provided images. This is an IP (Intellectual Property) character replacement task.`);

  // 제품 구조 보존 - 가장 중요
  sections.push(`[PRODUCT PRESERVATION - CRITICAL]
Take the EXACT product structure, shape, pose, and form from Image 1 (the product image). The product's physical structure must remain COMPLETELY UNCHANGED:
- Same overall shape and silhouette - do not modify the product's outline
- Same product dimensions and proportions - maintain exact size relationships
- Same functional elements (openings, handles, lids, buttons, etc.)
- Same pose and orientation in 3D space
- Same lighting setup, shadows, and reflections
- The product form is geometrically identical to the input product image`);

  // 캐릭터 적용 방법
  sections.push(`[CHARACTER APPLICATION]
Apply the character design from Image 2 (the character reference) onto this product:
- Replace ONLY the character/face/design elements, not the product structure
- The character's face should be adapted to fit the product's existing face area naturally
- Maintain the character's key identifying features (eye shape, color, expression, distinctive marks)
- The character's proportions should be adjusted to match the product's form factor
- Colors from the character should be applied to the product while maintaining material properties`);

  // 재질 설정
  if (settings.material) {
    const materialReq = materialRenderingRequirements[settings.material.type];
    if (materialReq) {
      sections.push(`[MATERIAL SPECIFICATION]\n${materialReq}`);
    }
    if (settings.material.customDescription) {
      sections.push(`Additional material details: ${settings.material.customDescription}`);
    }
  }

  // 색상 설정
  if (settings.color) {
    if (settings.color.mode === 'from_character') {
      sections.push(`[COLOR APPLICATION]
Extract the primary and secondary colors from the character reference image. Apply these colors to the product body and details while maintaining the specified material properties. The color should appear as if the product was manufactured in these colors, not painted or digitally altered.`);
    } else if (settings.color.customColor) {
      sections.push(`[COLOR APPLICATION]
Apply the custom color ${settings.color.customColor} to the product body. The color should appear as if the product was manufactured in this color, maintaining proper material reflections and depth for the specified material type.`);
    }
  }

  // 시점 설정
  if (settings.viewpoint) {
    const viewDesc = viewpointDescriptions[settings.viewpoint] || settings.viewpoint;
    sections.push(`[CAMERA ANGLE]\n${viewDesc}`);
  }

  // 우선순위 설정
  if (settings.priority === 'fix_structure') {
    sections.push(`[PRIORITY INSTRUCTION - STRUCTURE PRESERVATION]
HIERARCHY OF PRESERVATION (in order of importance):
1. Product physical structure and shape - NEVER change under any circumstances
2. Product material and texture - maintain exactly as specified
3. Product functional elements - keep all intact and functional-looking
4. Character key features - adapt to fit product while keeping recognizable
5. Color scheme - apply character's colors while respecting material properties`);
  } else if (settings.priority === 'copy_style') {
    sections.push(`[PRIORITY INSTRUCTION - STYLE MATCHING]
HIERARCHY OF PRESERVATION (in order of importance):
1. Character style and aesthetic - copy exactly, this is the primary goal
2. Product physical structure - maintain the general form
3. Style elements - transfer all stylistic choices from the reference
4. Color scheme - match the character's color palette precisely
5. Material appearance - adjust to support the character's visual style`);
  }

  // 변형 제어
  if (!settings.allowDeformation) {
    sections.push(`[DEFORMATION CONTROL]
The character's core proportions and silhouette must remain recognizable. Do not stretch, squash, or distort the character's features beyond what is necessary to fit the product form naturally.`);
  }

  // 투명 배경
  if (settings.transparentBackground) {
    sections.push(`[BACKGROUND SPECIFICATION]
Generate the image with a completely transparent background (alpha channel). The output should show only the product with no background elements, suitable for compositing onto any surface.`);
  }

  // 품질 요구사항
  sections.push(`[QUALITY REQUIREMENTS]
Generate a photorealistic product mockup with:
- Professional studio lighting with soft shadows
- High resolution suitable for e-commerce and catalog use
- Natural shadows and reflections appropriate for the material
- Clean, commercial-quality finish
- The final image should look like an actual manufactured product photograph, not a digital composite or 3D render`);

  return sections.join('\n\n');
}

/**
 * 스케치 → 목업 모드
 */
function buildSketchToMockupPrompt(settings: GenerationSettings): string {
  const sections: string[] = [];

  sections.push(`[TASK INSTRUCTION]
Transform this 2D design sketch into a photorealistic product mockup. The goal is to visualize how this design would look as an actual manufactured product.`);

  sections.push(`[DESIGN INTERPRETATION]
Analyze the provided sketch carefully and identify:
- The overall product shape and silhouette
- Character design elements and their intended appearance
- Proportions and spatial relationships between elements
- Intended material and finish (if suggested by the drawing style)
- Color indications or suggestions in the sketch`);

  sections.push(`[PRODUCT REALIZATION]
Create a realistic 3D product representation that:
- Preserves all design details, proportions, and artistic intent from the sketch
- Translates 2D line work into believable 3D forms with proper depth
- Adds appropriate material properties and surface details
- Maintains the character and charm of the original design
- Looks like a real manufactured item ready for production`);

  // 재질 설정
  if (settings.material) {
    const materialReq = materialRenderingRequirements[settings.material.type];
    if (materialReq) {
      sections.push(`[MATERIAL SPECIFICATION]\n${materialReq}`);
    }
    if (settings.material.customDescription) {
      sections.push(`Additional material details: ${settings.material.customDescription}`);
    }
  }

  // 색상 설정
  if (settings.color) {
    if (settings.color.mode === 'from_character') {
      sections.push(`[COLOR APPLICATION]
Use the colors suggested or implied in the sketch. If the sketch is in grayscale or limited colors, interpret the intended color scheme based on the character design context.`);
    } else if (settings.color.customColor) {
      sections.push(`[COLOR APPLICATION]
Apply the custom color ${settings.color.customColor} as the primary product color, maintaining the design proportions and material properties.`);
    }
  }

  // 시점 설정
  if (settings.viewpoint) {
    const viewDesc = viewpointDescriptions[settings.viewpoint] || settings.viewpoint;
    sections.push(`[CAMERA ANGLE]\n${viewDesc}`);
  }

  // 변형 제어
  if (!settings.allowDeformation) {
    sections.push(`[DESIGN FIDELITY]
Maintain strict adherence to the sketch's proportions and design intent. The 3D realization should be immediately recognizable as the same design, not a reinterpretation.`);
  }

  // 투명 배경
  if (settings.transparentBackground) {
    sections.push(`[BACKGROUND SPECIFICATION]
Generate the image with a completely transparent background (alpha channel).`);
  }

  sections.push(`[PHOTOREALISTIC RENDERING]
- Professional product photography lighting (softbox setup creating even, flattering light)
- Subtle shadows establishing depth and grounding the product
- Material-appropriate reflections and highlights
- Clean background suitable for e-commerce presentation
- High resolution with sharp focus on product details
- The output should look like a photograph of an actual manufactured product, not a 3D render or digital illustration`);

  return sections.join('\n\n');
}

/**
 * 배경 합성 모드
 */
function buildBackgroundCompositePrompt(settings: GenerationSettings): string {
  const sections: string[] = [];

  sections.push(`[TASK INSTRUCTION]
Create a composite image by integrating the character from Image 2 onto the product shown in Image 1. The result should appear as a factory-original product, not a digitally added design.`);

  sections.push(`[PRODUCT PRESERVATION - from Image 1]
The base product structure must remain exactly as shown:
- Exact product shape, size, and proportions unchanged
- Same material appearance and surface quality
- Same lighting and shadow setup
- Same camera angle and perspective
- All functional elements intact`);

  sections.push(`[CHARACTER INTEGRATION - from Image 2]
Apply the character design seamlessly onto the product:
- The character should appear as if it was originally manufactured as part of the product
- Adjust scale to fit appropriately on the product surface
- Match lighting and shadows to the original product photo
- For printed designs: follow the product's surface contours and curvature
- For 3D elements: add appropriate shadows, depth, and material transitions`);

  // 재질 설정
  if (settings.material) {
    const materialReq = materialRenderingRequirements[settings.material.type];
    if (materialReq) {
      sections.push(`[MATERIAL SPECIFICATION]\n${materialReq}`);
    }
  }

  // 색상 설정
  if (settings.color) {
    if (settings.color.mode === 'from_character') {
      sections.push(`[COLOR INTEGRATION]
Extract colors from the character and apply them to the product in a way that looks manufactured, not applied. The colors should appear as original product colors.`);
    } else if (settings.color.customColor) {
      sections.push(`[COLOR APPLICATION]
Incorporate the color ${settings.color.customColor} into the composite design.`);
    }
  }

  // 시점 설정
  if (settings.viewpoint) {
    const viewDesc = viewpointDescriptions[settings.viewpoint] || settings.viewpoint;
    sections.push(`[CAMERA ANGLE]\n${viewDesc}`);
  }

  // 변형 제어
  if (!settings.allowDeformation) {
    sections.push(`[CHARACTER PRESERVATION]
Maintain the character's key identifying features and proportions. The character should be immediately recognizable despite being adapted to the product's form.`);
  }

  // 투명 배경
  if (settings.transparentBackground) {
    sections.push(`[BACKGROUND SPECIFICATION]
Generate the final composite with a transparent background.`);
  }

  sections.push(`[OUTPUT QUALITY]
A seamless product photograph where the character integration looks factory-original, not digitally added. Professional quality suitable for commercial use.`);

  return sections.join('\n\n');
}

/**
 * 히스토리 기반 재생성 모드
 */
function buildHistoryBasedPrompt(settings: GenerationSettings): string {
  const sections: string[] = [];

  sections.push(`[TASK INSTRUCTION]
Using the successful product mockup from the previous generation as a template, create a new variation with a different character while maintaining complete visual consistency.`);

  sections.push(`[PRESERVE EXACTLY FROM PREVIOUS RESULT]
The following elements must be identical to the reference mockup:
- Product type, shape, and physical form
- Camera angle, distance, and composition
- Lighting setup, shadows, and reflections
- Background and staging elements
- Overall image quality, resolution, and style
- Material appearance and texture rendering`);

  sections.push(`[CHANGE ONLY]
- Replace the current character with the new character from the provided reference
- Apply the new character's distinctive features and color scheme
- Adapt the character's face and body to fit the same product form
- The new character should occupy the exact same product space as the original`);

  // 재질 설정
  if (settings.material) {
    const materialReq = materialRenderingRequirements[settings.material.type];
    if (materialReq) {
      sections.push(`[MATERIAL CONSISTENCY]\n${materialReq}\nMaintain exact material appearance from the previous generation.`);
    }
  }

  // 색상 설정
  if (settings.color) {
    if (settings.color.mode === 'from_character') {
      sections.push(`[COLOR VARIATION]
Apply the new character's color palette to the product, replacing the previous character's colors. The application method and material interaction should remain identical.`);
    } else if (settings.color.customColor) {
      sections.push(`[COLOR APPLICATION]
Apply the color ${settings.color.customColor} to this variation.`);
    }
  }

  // 시점 설정
  if (settings.viewpoint) {
    const viewDesc = viewpointDescriptions[settings.viewpoint] || settings.viewpoint;
    sections.push(`[CAMERA ANGLE CONSISTENCY]\nMaintain the same angle: ${viewDesc}`);
  }

  // 변형 제어
  if (!settings.allowDeformation) {
    sections.push(`[CHARACTER ADAPTATION]
The new character must be adapted to fit the same product form as the original, maintaining its key identifying features while matching the pose and position of the previous design.`);
  }

  // 투명 배경
  if (settings.transparentBackground) {
    sections.push(`[BACKGROUND]
Maintain transparent background consistent with previous generation.`);
  }

  sections.push(`[CONSISTENCY REQUIREMENTS]
- The new mockup should look like it belongs to the same product line/series
- Maintain identical product quality and manufacturing appearance
- Keep the same photographic style, mood, and commercial appeal
- This should appear as a product variant in the same catalog series`);

  return sections.join('\n\n');
}

/**
 * 생성 설정에 따른 전체 프롬프트 빌드 (메인 함수)
 */
export function buildPrompt(
  mode: GenerationModeType,
  settings: GenerationSettings
): string {
  switch (mode) {
    case 'ip_replacement':
      return buildIPReplacementPrompt(settings);
    case 'sketch_to_mockup':
      return buildSketchToMockupPrompt(settings);
    case 'background_composite':
      return buildBackgroundCompositePrompt(settings);
    case 'history_based':
      return buildHistoryBasedPrompt(settings);
    default:
      // 기본 폴백
      return buildIPReplacementPrompt(settings);
  }
}

/**
 * 인페인팅용 프롬프트 빌드
 */
export function buildInpaintPrompt(
  editType: 'material' | 'color' | 'shape' | 'add_detail',
  instruction: string
): string {
  const basePrompts: Record<string, string> = {
    material: `Modify the material of the selected masked area to match the user's instruction. The new material should blend seamlessly with the surrounding areas, maintaining consistent lighting and shadows.`,
    color: `Change the color of the selected masked area to match the user's instruction. The new color should appear natural and manufactured, not painted or digitally altered, with proper material interaction.`,
    shape: `Modify the shape of the selected masked area according to the user's instruction. The modification should look like it was designed this way from the start, with natural transitions to surrounding areas.`,
    add_detail: `Add the specified detail to the selected masked area. The new detail should appear as an original part of the product design, with appropriate material properties and lighting.`,
  };

  return `[INPAINTING TASK]
${basePrompts[editType]}

[USER INSTRUCTION]
${instruction}

[INTEGRATION REQUIREMENTS]
- Maintain perfect consistency with the unmasked areas
- Match the existing lighting direction and intensity
- Preserve the same material properties and surface quality
- Ensure seamless blending at mask boundaries
- The edit should be undetectable - it should look original

[QUALITY]
High quality, seamless integration, professional product photography appearance.`;
}
