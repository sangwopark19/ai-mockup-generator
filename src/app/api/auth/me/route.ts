// 현재 사용자 정보 API
// GET /api/auth/me

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import type { ApiResponse, UserWithoutPassword } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<UserWithoutPassword>>> {
  try {
    // 인증 확인
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
