"use client";

import { RepositoryList } from "@/components/repository-list";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Github,
  LogOut,
  Loader2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const { user, loading: authLoading, login, logout } = useAuth();

  // 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full" />
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4 relative" />
          </div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center shadow-xl shadow-primary/5">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full scale-150" />
              <div className="relative bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl">
                <FileText className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Auto Documentation
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              GitHub 저장소의 변경사항을 <br />
              자동으로 문서화하고 관리하세요
            </p>
            <Button
              onClick={login}
              size="lg"
              className="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub으로 로그인
            </Button>
            <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
              로그인하면 GitHub 저장소에 접근하여
              <br />
              자동 문서화 기능을 사용할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Auto Documentation</h1>
                <p className="text-xs text-muted-foreground">
                  자동 문서화 시스템
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/documents">
                <Button variant="ghost" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  최근 문서
                </Button>
              </Link>
              <div className="flex items-center gap-3 bg-muted/50 rounded-full pl-4 pr-2 py-1.5">
                <p className="text-sm font-medium">
                  {user.github_username}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title="로그아웃"
                  className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">내 저장소</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <RepositoryList userId={user.id} />
      </div>
    </main>
  );
}
