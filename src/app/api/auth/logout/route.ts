// 로그아웃 API
// POST /api/auth/logout

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // 인증 확인
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 해당 사용자의 모든 리프레시 토큰 삭제
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.',
    });
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return NextResponse.json(
      { success: false, error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
