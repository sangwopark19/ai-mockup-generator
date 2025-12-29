// 사용자 레포지토리 Prisma 구현체
// AI 목업 이미지 생성 프로그램

import { prisma } from '../index';
import type { IUserRepository } from '../interfaces/user.interface';
import type { User, SignUpDTO, UpdateProfileDTO } from '@/types';

export class PrismaUserRepository implements IUserRepository {
  // 사용자 ID로 조회
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  // 이메일로 조회
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  // 사용자 생성
  async create(data: SignUpDTO & { password: string }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });
    return user;
  }

  // 사용자 수정
  async update(id: string, data: UpdateProfileDTO): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user;
  }

  // 사용자 삭제
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}

// 싱글톤 인스턴스 내보내기
export const userRepository = new PrismaUserRepository();
