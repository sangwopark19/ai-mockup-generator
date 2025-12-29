// 토큰 갱신 API
// POST /api/auth/refresh

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '@/lib/auth/jwt';
import { userRepository } from '@/lib/db/repositories/user.repository';
import { prisma } from '@/lib/db';
import type { ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AuthResponse>>> {
  try {
    // 요청 본문에서 리프레시 토큰 추출
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: '리프레시 토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    // 토큰 검증
    const payload = verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // DB에서 토큰 확인
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // 만료된 토큰 삭제
      if (storedToken) {
        await prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
      }
      return NextResponse.json(
        { success: false, error: '토큰이 만료되었습니다. 다시 로그인해 주세요.' },
        { status: 401 }
      );
    }

    // 사용자 조회
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 새 토큰 생성
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // 기존 토큰 삭제 및 새 토큰 저장
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
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
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      message: '토큰이 갱신되었습니다.',
    });
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    return NextResponse.json(
      { success: false, error: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
