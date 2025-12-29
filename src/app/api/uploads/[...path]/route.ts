// 로컬 파일 서빙 API (개발 환경용)
// GET /api/uploads/[...path]

import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { path } = await params;
    const filePath = path.join('/');

    // 파일 존재 여부 확인
    const exists = await storage.exists(filePath);
    if (!exists) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 파일 다운로드
    const buffer = await storage.download(filePath);

    // MIME 타입 결정
    const mimeType = getMimeType(filePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('파일 서빙 오류:', error);
    return NextResponse.json(
      { error: '파일 로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 파일 확장자에 따른 MIME 타입 반환
function getMimeType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}
