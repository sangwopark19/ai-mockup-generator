// 스토리지 프로바이더 팩토리
// 환경 변수에 따라 적절한 프로바이더 반환

import type { IStorageProvider } from './provider';
import { LocalStorageProvider } from './local';

// 스토리지 프로바이더 팩토리 함수
function createStorageProvider(): IStorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'local':
      return new LocalStorageProvider();
    // 향후 추가 가능:
    // case 's3':
    //   return new S3StorageProvider();
    // case 'supabase':
    //   return new SupabaseStorageProvider();
    // case 'gcs':
    //   return new GCSStorageProvider();
    default:
      console.warn(`알 수 없는 스토리지 프로바이더: ${provider}, 로컬 사용`);
      return new LocalStorageProvider();
  }
}

// 스토리지 프로바이더 인스턴스 내보내기
export const storage = createStorageProvider();

// 타입도 내보내기
export type { IStorageProvider } from './provider';
