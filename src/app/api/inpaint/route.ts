// 인페인팅 API
// POST /api/inpaint

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { aiProvider } from '@/lib/ai';
import { storage } from '@/lib/storage';
import { inpaintRequestSchema } from '@/lib/utils/validation';
import { v4 as uuidv4 } from 'uuid';
import type { ApiResponse, InpaintResponse } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<InpaintResponse>>> {
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
    const result = inpaintRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    const { imageUrl, maskData, instruction } = result.data;

    // AI 인페인팅 실행
    const resultImage = await aiProvider.inpaint(
      imageUrl,
      maskData,
      instruction
    );

    // 결과 이미지 저장
    const imageId = uuidv4();
    const imagePath = `${user.id}/inpaint/${imageId}.png`;
    
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
      message: '부분 편집이 완료되었습니다.',
    });
  } catch (error) {
    console.error('인페인팅 오류:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : '부분 편집 중 오류가 발생했습니다.';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
