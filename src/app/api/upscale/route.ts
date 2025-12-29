// 업스케일 API
// POST /api/upscale

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { aiProvider } from '@/lib/ai';
import { storage } from '@/lib/storage';
import { upscaleRequestSchema } from '@/lib/utils/validation';
import { v4 as uuidv4 } from 'uuid';
import type { ApiResponse, UpscaleResponse } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UpscaleResponse>>> {
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
    const result = upscaleRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    const { imageUrl, targetResolution } = result.data;

    // AI 업스케일 실행
    const resultImage = await aiProvider.upscale(imageUrl, targetResolution);

    // 결과 이미지 저장
    const imageId = uuidv4();
    const imagePath = `${user.id}/upscale/${imageId}.png`;
    
    // base64에서 버퍼로 변환
    const base64Data = resultImage.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const url = await storage.upload(buffer, imagePath, 'image/png');

    return NextResponse.json({
      success: true,
      data: {
        success: true,
        resultImage: url,
      },
      message: '고해상도 변환이 완료되었습니다.',
    });
  } catch (error) {
    console.error('업스케일 오류:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : '고해상도 변환 중 오류가 발생했습니다.';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
