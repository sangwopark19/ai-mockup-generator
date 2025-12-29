// 회원가입 API
// POST /api/auth/signup

import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/lib/db/repositories/user.repository';
import { hashPassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '@/lib/auth/jwt';
import { signUpSchema } from '@/lib/utils/validation';
import { prisma } from '@/lib/db';
import type { ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AuthResponse>>> {
  try {
    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검사
    const result = signUpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // 이메일 중복 확인
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    // 토큰 생성
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // 리프레시 토큰 저장
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    // 응답 (비밀번호 제외)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        message: '회원가입이 완료되었습니다.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json(
      { success: false, error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
