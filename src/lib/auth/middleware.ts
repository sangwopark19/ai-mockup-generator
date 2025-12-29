// 인증 미들웨어
// API 라우트에서 인증 처리

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { userRepository } from '@/lib/db/repositories/user.repository';
import type { UserWithoutPassword } from '@/types';

// 인증된 요청 타입
export interface AuthenticatedRequest extends NextRequest {
  user?: UserWithoutPassword;
}

/**
 * 인증 미들웨어 - API 라우트에서 사용
 * @param request - Next.js 요청 객체
 * @returns 인증된 사용자 정보 또는 null
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<UserWithoutPassword | null> {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    
    // 토큰 검증
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // 사용자 조회
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      return null;
    }

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('인증 미들웨어 오류:', error);
    return null;
  }
}

/**
 * 인증 필수 API 라우트 래퍼
 * @param handler - API 핸들러 함수
 * @returns 래핑된 핸들러
 */
export function withAuth<T>(
  handler: (
    request: NextRequest,
    user: UserWithoutPassword
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { error: string }>> => {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다. 로그인해 주세요.' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

/**
 * 인증 응답 생성
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: '인증이 필요합니다.' },
    { status: 401 }
  );
}

export function forbiddenResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: '접근 권한이 없습니다.' },
    { status: 403 }
  );
}
