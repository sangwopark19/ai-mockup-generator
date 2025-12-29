// 스토리지 프로바이더 인터페이스
// 스토리지 교체 시 이 인터페이스만 구현하면 됨

export interface IStorageProvider {
  // 프로바이더 이름
  readonly name: string;
  
  // 파일 업로드 - URL 반환
  upload(file: Buffer, path: string, mimetype: string): Promise<string>;
  
  // 파일 다운로드
  download(path: string): Promise<Buffer>;
  
  // 파일 삭제
  delete(path: string): Promise<void>;
  
  // 서명된 URL 가져오기 (일정 시간 후 만료)
  getSignedUrl(path: string, expiresIn: number): Promise<string>;
  
  // 파일 목록 조회
  listFiles(prefix: string): Promise<string[]>;
  
  // 파일 존재 여부 확인
  exists(path: string): Promise<boolean>;
}
