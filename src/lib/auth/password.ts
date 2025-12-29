// 비밀번호 해싱 유틸리티
// bcrypt를 사용한 안전한 비밀번호 처리

import bcrypt from 'bcryptjs';

// 솔트 라운드 (높을수록 보안↑, 성능↓)
const SALT_ROUNDS = 10;

/**
 * 비밀번호 해싱
 * @param password - 평문 비밀번호
 * @returns 해시된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 비밀번호 검증
 * @param password - 평문 비밀번호
 * @param hashedPassword - 해시된 비밀번호
 * @returns 일치 여부
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
