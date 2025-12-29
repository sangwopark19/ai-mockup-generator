// 사용자 레포지토리 인터페이스
// 데이터베이스 교체 시 이 인터페이스만 구현하면 됨

import type { User, SignUpDTO, UpdateProfileDTO } from '@/types';

export interface IUserRepository {
  // 사용자 조회
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  
  // 사용자 생성
  create(data: SignUpDTO & { password: string }): Promise<User>;
  
  // 사용자 수정
  update(id: string, data: UpdateProfileDTO): Promise<User>;
  
  // 사용자 삭제
  delete(id: string): Promise<void>;
}
