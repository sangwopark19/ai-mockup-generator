// 이미지 생성 API
// POST /api/generate

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { projectRepository } from '@/lib/db/repositories/project.repository';
import { historyRepository } from '@/lib/db/repositories/history.repository';
import { aiProvider } from '@/lib/ai';
import { storage } from '@/lib/storage';
import { generateRequestSchema } from '@/lib/utils/validation';
import { v4 as uuidv4 } from 'uuid';
import type { ApiResponse, GenerateImageResponse } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<GenerateImageResponse>>> {
  try {
    // 인증 확인
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검사
    const result = generateRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    const { projectId, mode, inputImages, settings } = result.data;

    // 프로젝트 소유권 확인
    const isOwner = await projectRepository.isOwner(projectId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 입력 이미지 저장
    const savedInputImages: string[] = [];
    for (const image of inputImages) {
      const imageId = uuidv4();
      const imagePath = `${user.id}/${projectId}/inputs/${imageId}.png`;
      
      // base64에서 버퍼로 변환
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const url = await storage.upload(buffer, imagePath, 'image/png');
      savedInputImages.push(url);
    }

    // AI 이미지 생성 (1장)
    const generatedImages = await aiProvider.generateImages(
      mode,
      { ...settings, inputImages: savedInputImages },
      inputImages,
      1
    );

    // 생성된 이미지 저장
    const savedOutputImages: string[] = [];
    for (const image of generatedImages) {
      const imageId = uuidv4();
      const imagePath = `${user.id}/${projectId}/outputs/${imageId}.png`;
      
      // base64에서 버퍼로 변환
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const url = await storage.upload(buffer, imagePath, 'image/png');
      savedOutputImages.push(url);
    }

    // 생성 이력 저장
    const history = await historyRepository.create({
      projectId,
      mode,
      inputImages: savedInputImages,
      outputImages: savedOutputImages,
      settings,
    });

    return NextResponse.json({
      success: true,
      data: {
        success: true,
        images: savedOutputImages,
        historyId: history.id,
      },
      message: '이미지가 생성되었습니다.',
    });
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    
    // 에러 메시지 추출
    const errorMessage = error instanceof Error 
      ? error.message 
      : '이미지 생성 중 오류가 발생했습니다.';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
