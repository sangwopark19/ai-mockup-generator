// JWT 토큰 유틸리티
// Access Token과 Refresh Token 생성 및 검증

import jwt from 'jsonwebtoken';
import type { JWTPayload } from '@/types';

// 환경 변수에서 설정 가져오기
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// 만료 시간 (초 단위)
const ACCESS_EXPIRES_IN_SECONDS = 15 * 60; // 15분
const REFRESH_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60; // 7일

/**
 * Access Token 생성
 * @param payload - 토큰에 담을 데이터
 * @returns JWT 토큰 문자열
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(
    { userId: payload.userId, email: payload.email },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN_SECONDS }
  );
}

/**
 * Refresh Token 생성
 * @param payload - 토큰에 담을 데이터
 * @returns JWT 토큰 문자열
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(
    { userId: payload.userId, email: payload.email },
    JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN_SECONDS }
  );
}

/**
 * 토큰 검증
 * @param token - JWT 토큰 문자열
 * @returns 디코딩된 페이로드 또는 null
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    return null;
  }
}

/**
 * 토큰에서 페이로드 추출 (검증 없이)
 * @param token - JWT 토큰 문자열
 * @returns 디코딩된 페이로드 또는 null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Refresh Token 만료 시간 계산
 * @returns 만료 일시
 */
export function getRefreshTokenExpiry(): Date {
  // 7일 후
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry;
}
