// 유효성 검사 스키마
// Zod를 사용한 타입 안전한 검증

import { z } from 'zod';

// ==================== 인증 관련 스키마 ====================

export const signUpSchema = z.object({
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다.')
    .min(1, '이메일을 입력해 주세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      '비밀번호는 영문과 숫자를 포함해야 합니다.'
    ),
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(50, '이름은 50자를 초과할 수 없습니다.'),
});

export const signInSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(50, '이름은 50자를 초과할 수 없습니다.')
    .optional(),
  profileImage: z.string().url('올바른 URL 형식이 아닙니다.').optional(),
});

// ==================== 프로젝트 관련 스키마 ====================

export const categorySchema = z.enum(['general_goods', 'plush_textiles', 'figures']);

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, '프로젝트 이름을 입력해 주세요.')
    .max(100, '프로젝트 이름은 100자를 초과할 수 없습니다.'),
  description: z
    .string()
    .max(500, '설명은 500자를 초과할 수 없습니다.')
    .optional(),
  category: categorySchema,
  ipCharacter: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, '프로젝트 이름을 입력해 주세요.')
    .max(100, '프로젝트 이름은 100자를 초과할 수 없습니다.')
    .optional(),
  description: z
    .string()
    .max(500, '설명은 500자를 초과할 수 없습니다.')
    .optional(),
  category: categorySchema.optional(),
  ipCharacter: z.string().optional(),
});

// ==================== 생성 관련 스키마 ====================

export const generationModeSchema = z.enum([
  'ip_replacement',
  'sketch_to_mockup',
  'background_composite',
  'history_based',
]);

export const materialTypeSchema = z.enum([
  'plastic_glossy',
  'plastic_matte',
  'plush_fabric',
  'plush_fur',
  'ceramic',
  'porcelain',
  'transparent_plastic',
  'transparent_glass',
]);

export const viewpointSchema = z.enum([
  'front',
  'three_quarter',
  'top',
  'bottom',
  'preview',
]);

export const prioritySchema = z.enum(['fix_structure', 'copy_style']);

export const generationSettingsSchema = z.object({
  inputImages: z.array(z.string()).min(1, '최소 1개 이상의 이미지가 필요합니다.'),
  material: z
    .object({
      type: materialTypeSchema,
      customDescription: z.string().optional(),
    })
    .optional(),
  color: z
    .object({
      mode: z.enum(['from_character', 'custom']),
      customColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 HEX 색상 코드가 아닙니다.').optional(),
    })
    .optional(),
  viewpoint: viewpointSchema.optional(),
  priority: prioritySchema.optional(),
  allowDeformation: z.boolean().optional(),
  transparentBackground: z.boolean().optional(),
});

export const generateRequestSchema = z.object({
  projectId: z.string().min(1, '프로젝트 ID가 필요합니다.'),
  mode: generationModeSchema,
  inputImages: z.array(z.string()).min(1, '최소 1개 이상의 이미지가 필요합니다.'),
  settings: generationSettingsSchema,
  referenceHistoryId: z.string().optional(),
});

// ==================== 인페인팅 관련 스키마 ====================

export const editTypeSchema = z.enum(['material', 'color', 'shape', 'add_detail']);

export const inpaintRequestSchema = z.object({
  imageUrl: z.string().min(1, '이미지 URL이 필요합니다.'),
  maskData: z.string().min(1, '마스크 데이터가 필요합니다.'),
  editType: editTypeSchema,
  instruction: z.string().min(1, '수정 지시사항을 입력해 주세요.'),
});

// ==================== 업스케일 관련 스키마 ====================

export const upscaleRequestSchema = z.object({
  imageUrl: z.string().min(1, '이미지 URL이 필요합니다.'),
  targetResolution: z.union([z.literal(2048), z.literal(4096)]),
  transparentBackground: z.boolean().optional(),
});

// 타입 추출 헬퍼
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;
export type InpaintRequestInput = z.infer<typeof inpaintRequestSchema>;
export type UpscaleRequestInput = z.infer<typeof upscaleRequestSchema>;
