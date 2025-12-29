-- 데이터베이스 초기화 스크립트
-- AI 목업 이미지 생성 프로그램

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 기본 설정
SET timezone = 'Asia/Seoul';

-- 초기화 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '데이터베이스 초기화가 완료되었습니다.';
END $$;
