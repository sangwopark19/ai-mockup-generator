// 전역 타입 정의
// AI 목업 이미지 생성 프로그램

// ==================== 사용자 관련 타입 ====================

export interface User {
  id: string;
  email: string;
  password: string; // bcrypt 해시됨
  name: string;
  profileImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface SignUpDTO {
  email: string;
  password: string;
  name: string;
}

export interface SignInDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  name?: string;
  profileImage?: string;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  accessToken: string;
  refreshToken: string;
}

// ==================== 프로젝트 관련 타입 ====================

export type CategoryType = 'general_goods' | 'plush_textiles' | 'figures';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category: CategoryType;
  ipCharacter?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  category: CategoryType;
  ipCharacter?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  category?: CategoryType;
  ipCharacter?: string;
}

// ==================== 생성 관련 타입 ====================

export type GenerationModeType = 
  | 'ip_replacement' 
  | 'sketch_to_mockup' 
  | 'background_composite' 
  | 'history_based';

export type MaterialType = 
  | 'plastic_glossy' 
  | 'plastic_matte' 
  | 'plush_fabric' 
  | 'plush_fur' 
  | 'ceramic' 
  | 'porcelain' 
  | 'transparent_plastic' 
  | 'transparent_glass';

export type ViewpointType = 'front' | 'three_quarter' | 'top' | 'bottom' | 'preview';

export type PriorityType = 'fix_structure' | 'copy_style';

export type EditType = 'material' | 'color' | 'shape' | 'add_detail';

export interface MaterialSettings {
  type: MaterialType;
  customDescription?: string;
}

export interface ColorSettings {
  mode: 'from_character' | 'custom';
  customColor?: string; // hex 코드
}

export interface GenerationSettings {
  // 필수
  inputImages: string[];
  
  // 재질 (선택)
  material?: MaterialSettings;
  
  // 색상 (선택)
  color?: ColorSettings;
  
  // 시점 (선택)
  viewpoint?: ViewpointType;
  
  // 우선순위 (선택)
  priority?: PriorityType;
  
  // 변형 허용 (선택)
  allowDeformation?: boolean;
  
  // 투명 배경 (선택)
  transparentBackground?: boolean;
}

export interface GenerationHistory {
  id: string;
  projectId: string;
  mode: GenerationModeType;
  inputImages: string[];
  outputImages: string[];
  settings: GenerationSettings;
  isFavorite: boolean;
  createdAt: Date;
}

export interface CreateGenerationDTO {
  projectId: string;
  mode: GenerationModeType;
  inputImages: string[];
  settings: GenerationSettings;
  referenceHistoryId?: string; // Mode D용
}

// ==================== 즐겨찾기 템플릿 타입 ====================

export interface FavoriteTemplate {
  id: string;
  historyId: string;
  name: string;
  tags: string[];
  createdAt: Date;
}

export interface CreateFavoriteTemplateDTO {
  historyId: string;
  name: string;
  tags?: string[];
}

// ==================== API 응답 타입 ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateImageResponse {
  success: boolean;
  images: string[]; // 4개 이미지 URL
  historyId: string;
}

export interface InpaintResponse {
  success: boolean;
  resultImage: string;
}

export interface UpscaleResponse {
  success: boolean;
  resultImage: string;
}

// ==================== 인페인팅 타입 ====================

export interface InpaintRequest {
  imageUrl: string;
  maskData: string; // base64 마스크 이미지
  editType: EditType;
  instruction: string; // "손잡이를 둥글게", "빨간색으로 변경" 등
}

// ==================== 업스케일 타입 ====================

export interface UpscaleRequest {
  imageUrl: string;
  targetResolution: 2048 | 4096;
  transparentBackground?: boolean;
}

// ==================== JWT 토큰 타입 ====================

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}
