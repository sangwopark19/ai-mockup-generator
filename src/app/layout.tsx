// 루트 레이아웃

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 목업 생성기 - 제품 목업 이미지를 AI로 쉽게 생성",
  description: "디자이너를 위한 AI 기반 제품 목업 이미지 생성 도구. IP 캐릭터 교체, 스케치 변환, 배경 합성 등 다양한 기능을 제공합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
