// 프로젝트 상세 API
// GET /api/projects/[projectId] - 프로젝트 조회
// PUT /api/projects/[projectId] - 프로젝트 수정
// DELETE /api/projects/[projectId] - 프로젝트 삭제

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { projectRepository } from '@/lib/db/repositories/project.repository';
import { updateProjectSchema } from '@/lib/utils/validation';
import type { ApiResponse, Project } from '@/types';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// 프로젝트 조회
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const { projectId } = await params;
    
    // 인증 확인
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 프로젝트 조회
    const project = await projectRepository.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 소유권 확인 (데이터 격리)
    if (project.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('프로젝트 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '프로젝트 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 프로젝트 수정
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const { projectId } = await params;
    
    // 인증 확인
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 소유권 확인
    const isOwner = await projectRepository.isOwner(projectId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검사
    const result = updateProjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    // 프로젝트 수정
    const project = await projectRepository.update(projectId, result.data);

    return NextResponse.json({
      success: true,
      data: project,
      message: '프로젝트가 수정되었습니다.',
    });
  } catch (error) {
    console.error('프로젝트 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '프로젝트 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 프로젝트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const { projectId } = await params;
    
    // 인증 확인
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 소유권 확인
    const isOwner = await projectRepository.isOwner(projectId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 소프트 삭제
    await projectRepository.softDelete(projectId);

    return NextResponse.json({
      success: true,
      message: '프로젝트가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('프로젝트 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '프로젝트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
