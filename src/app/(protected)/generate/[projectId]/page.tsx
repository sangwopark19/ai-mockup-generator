'use client';

// 이미지 생성 페이지

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectStore } from '@/stores/project-store';
import { useGenerationStore } from '@/stores/generation-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ImageUploader } from '@/components/generation/ImageUploader';
import { MaterialSelector } from '@/components/generation/MaterialSelector';
import { ViewpointSelector } from '@/components/generation/ViewpointSelector';
import { ColorPicker } from '@/components/generation/ColorPicker';
import { ResultGrid } from '@/components/generation/ResultGrid';
import { GenerationProgress } from '@/components/generation/GenerationProgress';
import { toast } from 'sonner';
import type { GenerationModeType } from '@/types';

const modes: { value: GenerationModeType; label: string; icon: string; description: string }[] = [
  {
    value: 'ip_replacement',
    label: 'IP 교체',
    icon: '🔄',
    description: '기존 제품에서 캐릭터만 교체',
  },
  {
    value: 'sketch_to_mockup',
    label: '스케치 → 목업',
    icon: '✏️',
    description: '스케치를 실사 목업으로 변환',
  },
  {
    value: 'background_composite',
    label: '배경 합성',
    icon: '🖼️',
    description: '캐릭터를 제품에 합성',
  },
  {
    value: 'history_based',
    label: '히스토리 기반',
    icon: '📚',
    description: '이전 결과 기반 재생성',
  },
];

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { accessToken } = useAuthStore();
  const { currentProject, setCurrentProject } = useProjectStore();
  const {
    mode,
    setMode,
    settings,
    setSettings,
    inputImages,
    setInputImages,
    generatedImages,
    setGeneratedImages,
    selectedImage,
    setSelectedImage,
    isGenerating,
    setIsGenerating,
    progress,
    setProgress,
    setError,
    reset,
  } = useGenerationStore();

  const [productImage, setProductImage] = useState<File | null>(null);
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 프로젝트 로드
  useEffect(() => {
    const fetchProject = async () => {
      if (!accessToken || !projectId) return;

      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentProject(data.data);
        } else if (response.status === 403 || response.status === 404) {
          toast.error('프로젝트에 접근할 수 없습니다.');
          router.push('/projects');
        }
      } catch (error) {
        console.error('프로젝트 로드 오류:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchProject();

    return () => {
      reset();
    };
  }, [accessToken, projectId, setCurrentProject, reset, router]);

  // 파일을 base64로 변환
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 이미지 생성
  const handleGenerate = useCallback(async () => {
    if (!productImage) {
      toast.error('제품 이미지를 업로드해 주세요.');
      return;
    }

    if (mode !== 'sketch_to_mockup' && !characterImage) {
      toast.error('캐릭터 이미지를 업로드해 주세요.');
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setGeneratedImages([]);
    setSelectedImage(null);

    try {
      // 이미지를 base64로 변환
      const inputImagesBase64: string[] = [];
      inputImagesBase64.push(await fileToBase64(productImage));
      if (characterImage) {
        inputImagesBase64.push(await fileToBase64(characterImage));
      }

      setProgress(30);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          projectId,
          mode,
          inputImages: inputImagesBase64,
          settings: {
            ...settings,
            inputImages: inputImagesBase64,
          },
        }),
      });

      setProgress(80);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이미지 생성에 실패했습니다.');
      }

      setProgress(100);
      setGeneratedImages(data.data.images);
      toast.success('이미지 생성이 완료되었습니다!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [
    productImage,
    characterImage,
    mode,
    settings,
    projectId,
    accessToken,
    setIsGenerating,
    setProgress,
    setGeneratedImages,
    setSelectedImage,
    setError,
  ]);

  // 이미지 다운로드
  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mockup-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('이미지가 다운로드되었습니다.');
    } catch (error) {
      toast.error('다운로드에 실패했습니다.');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{currentProject?.name || '이미지 생성'}</h1>
          <p className="text-muted-foreground">
            AI로 제품 목업 이미지를 생성합니다
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 설정 패널 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 모드 선택 */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1: 모드 선택</CardTitle>
              <CardDescription>생성 방식을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {modes.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      mode === m.value
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    disabled={isGenerating}
                  >
                    <span className="text-2xl block mb-1">{m.icon}</span>
                    <span className="text-xs font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 이미지 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle>Step 2: 이미지 업로드</CardTitle>
              <CardDescription>
                {mode === 'sketch_to_mockup'
                  ? '스케치 이미지를 업로드하세요'
                  : '제품과 캐릭터 이미지를 업로드하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploader
                label={mode === 'sketch_to_mockup' ? '스케치 이미지' : '제품 이미지'}
                description="기존 제품 사진 또는 스케치"
                value={productImage}
                onChange={setProductImage}
              />
              {mode !== 'sketch_to_mockup' && (
                <ImageUploader
                  label="캐릭터 이미지"
                  description="교체할 IP 캐릭터"
                  value={characterImage}
                  onChange={setCharacterImage}
                />
              )}
            </CardContent>
          </Card>

          {/* 상세 옵션 */}
          <Card>
            <CardHeader>
              <CardTitle>Step 3: 상세 옵션</CardTitle>
              <CardDescription>세부 설정을 조정하세요 (선택)</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="material" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="material">재질</TabsTrigger>
                  <TabsTrigger value="color">색상</TabsTrigger>
                  <TabsTrigger value="view">시점</TabsTrigger>
                </TabsList>
                <TabsContent value="material" className="mt-4">
                  <MaterialSelector
                    value={settings.material}
                    onChange={(v) => setSettings({ material: v })}
                  />
                </TabsContent>
                <TabsContent value="color" className="mt-4">
                  <ColorPicker
                    value={settings.color}
                    onChange={(v) => setSettings({ color: v })}
                  />
                </TabsContent>
                <TabsContent value="view" className="mt-4">
                  <ViewpointSelector
                    value={settings.viewpoint}
                    onChange={(v) => setSettings({ viewpoint: v })}
                  />
                </TabsContent>
              </Tabs>

              <Separator className="my-4" />

              {/* 추가 옵션 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>투명 배경</Label>
                    <p className="text-xs text-muted-foreground">
                      배경 없이 제품만 생성
                    </p>
                  </div>
                  <Switch
                    checked={settings.transparentBackground || false}
                    onCheckedChange={(v) => setSettings({ transparentBackground: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>변형 허용</Label>
                    <p className="text-xs text-muted-foreground">
                      캐릭터 비율 변형 허용
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowDeformation || false}
                    onCheckedChange={(v) => setSettings({ allowDeformation: v })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 생성 버튼 */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || !productImage}
          >
            {isGenerating ? '생성 중...' : '🎨 이미지 생성하기'}
          </Button>
        </div>

        {/* 오른쪽: 결과 패널 */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>생성 결과</CardTitle>
              <CardDescription>
                {isGenerating
                  ? 'AI가 이미지를 생성하고 있습니다...'
                  : generatedImages.length > 0
                  ? '마음에 드는 이미지를 선택하세요'
                  : '이미지를 업로드하고 생성 버튼을 클릭하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <GenerationProgress isGenerating={isGenerating} progress={progress} />
              ) : (
                <ResultGrid
                  images={generatedImages}
                  selectedImage={selectedImage}
                  onSelect={setSelectedImage}
                  onDownload={handleDownload}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
