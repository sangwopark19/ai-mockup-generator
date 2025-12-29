// 프로젝트 CRUD API
// GET /api/projects - 프로젝트 목록 조회
// POST /api/projects - 프로젝트 생성

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { projectRepository } from '@/lib/db/repositories/project.repository';
import { createProjectSchema } from '@/lib/utils/validation';
import type { ApiResponse, Project } from '@/types';

// 프로젝트 목록 조회
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Project[]>>> {
  try {
    // 인증 확인
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 해당 사용자의 프로젝트만 조회 (데이터 격리)
    const projects = await projectRepository.findAllByUserId(user.id);

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('프로젝트 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '프로젝트 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 프로젝트 생성
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    // 인증 확인
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검사
    const result = createProjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    // 프로젝트 생성
    const project = await projectRepository.create(user.id, result.data);

    return NextResponse.json(
      {
        success: true,
        data: project,
        message: '프로젝트가 생성되었습니다.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('프로젝트 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '프로젝트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
