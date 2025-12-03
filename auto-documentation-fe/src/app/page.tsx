"use client";

import { RepositoryList } from "@/components/repository-list";
import { Button } from "@/components/ui/button";
import { FileText, Github, LogOut, Loader2, FolderGit2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, loading: authLoading, login, logout } = useAuth();

  // 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Auto Documentation</h1>
            <p className="text-muted-foreground mb-8">
              GitHub 저장소의 변경사항을 자동으로 문서화하고 관리하세요
            </p>
            <Button onClick={login} size="lg" className="w-full">
              <Github className="w-5 h-5 mr-2" />
              GitHub으로 로그인
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              로그인하면 GitHub 저장소에 접근하여 자동 문서화 기능을 사용할 수
              있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Auto Documentation
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                GitHub 저장소의 변경사항을 자동으로 문서화합니다
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-l pl-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.github_username}</p>
                  <p className="text-xs text-muted-foreground">
                    GitHub ID: {user.github_id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Repository List Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FolderGit2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">내 저장소</h2>
          </div>
          <RepositoryList userId={user.id} />
        </div>
      </div>
    </main>
  );
}
