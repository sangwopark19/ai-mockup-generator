// 로컬 파일 시스템 스토리지 프로바이더
// 개발 환경용 - Docker 볼륨 마운트 경로 사용

import fs from 'fs/promises';
import path from 'path';
import type { IStorageProvider } from './provider';

export class LocalStorageProvider implements IStorageProvider {
  readonly name = 'local';
  private basePath: string;
  private baseUrl: string;

  constructor() {
    this.basePath = process.env.LOCAL_UPLOAD_PATH || './uploads';
    this.baseUrl = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:3000/api/uploads';
  }

  // 파일 업로드
  async upload(file: Buffer, filePath: string, _mimetype: string): Promise<string> {
    const fullPath = path.join(this.basePath, filePath);
    const dir = path.dirname(fullPath);

    // 디렉토리가 없으면 생성
    await fs.mkdir(dir, { recursive: true });

    // 파일 저장
    await fs.writeFile(fullPath, file);

    // URL 반환
    return `${this.baseUrl}/${filePath}`;
  }

  // 파일 다운로드
  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.basePath, filePath);
    return fs.readFile(fullPath);
  }

  // 파일 삭제
  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // 파일이 없으면 무시
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  // 서명된 URL (로컬에서는 그냥 URL 반환)
  async getSignedUrl(filePath: string, _expiresIn: number): Promise<string> {
    return `${this.baseUrl}/${filePath}`;
  }

  // 파일 목록 조회
  async listFiles(prefix: string): Promise<string[]> {
    const fullPath = path.join(this.basePath, prefix);
    
    try {
      const files = await fs.readdir(fullPath, { recursive: true });
      return files.map(f => path.join(prefix, f.toString()));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // 파일 존재 여부 확인
  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
