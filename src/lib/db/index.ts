// 데이터베이스 클라이언트 및 레포지토리 내보내기
// AI 목업 이미지 생성 프로그램

import { PrismaClient } from '@prisma/client';

// 전역 Prisma 클라이언트 인스턴스 (개발 환경에서 Hot Reload 시 연결 누수 방지)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 레포지토리 인스턴스 내보내기 (나중에 구현)
// export { userRepository } from './repositories/user.repository';
// export { projectRepository } from './repositories/project.repository';
// export { historyRepository } from './repositories/history.repository';

export default prisma;
