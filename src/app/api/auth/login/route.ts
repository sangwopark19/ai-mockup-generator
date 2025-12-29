// 로그인 API
// POST /api/auth/login

import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/lib/db/repositories/user.repository';
import { verifyPassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '@/lib/auth/jwt';
import { signInSchema } from '@/lib/utils/validation';
import { prisma } from '@/lib/db';
import type { ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AuthResponse>>> {
  try {
    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검사
    const result = signInSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // 사용자 조회
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 토큰 생성
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // 기존 리프레시 토큰 삭제 (선택적: 다중 세션 허용 시 제거)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    // 새 리프레시 토큰 저장
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    // 응답 (비밀번호 제외)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      message: '로그인되었습니다.',
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { success: false, error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
