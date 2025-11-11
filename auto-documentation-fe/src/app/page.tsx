"use client";

import { useState } from "react";
import { mockPendingDocs, mockRepositories, PendingDocumentation } from "@/lib/mock-data";
import { PendingDocCard } from "@/components/pending-doc-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle, Clock, Filter, Github, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [docs, setDocs] = useState<PendingDocumentation[]>(mockPendingDocs);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const handleApprove = (id: string, editedDoc?: string) => {
    setDocs((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === id) {
          const updatedDoc = { ...doc, status: "approved" as const };
          if (editedDoc) {
            updatedDoc.documentation = {
              ...updatedDoc.documentation,
              details: editedDoc,
            };
          }
          return updatedDoc;
        }
        return doc;
      })
    );
  };

  const handleReject = (id: string) => {
    setDocs((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === id ? { ...doc, status: "rejected" as const } : doc
      )
    );
  };

  const filteredDocs = docs.filter((doc) => {
    if (filter === "all") return true;
    return doc.status === filter;
  });

  const stats = {
    total: docs.length,
    pending: docs.filter((d) => d.status === "pending").length,
    approved: docs.filter((d) => d.status === "approved").length,
    rejected: docs.filter((d) => d.status === "rejected").length,
  };

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
            <Button
              onClick={login}
              size="lg"
              className="w-full"
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub으로 로그인
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              로그인하면 GitHub 저장소에 접근하여 자동 문서화 기능을 사용할 수 있습니다.
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
                자동 생성된 문서를 검토하고 승인하세요
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {mockRepositories.length} 레포지토리
              </Badge>
              <div className="flex items-center gap-2 border-l pl-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.github_username}</p>
                  <p className="text-xs text-muted-foreground">GitHub ID: {user.github_id}</p>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">대기 중</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">승인됨</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">거부됨</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">필터:</span>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              전체
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              대기 중
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
            >
              승인됨
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("rejected")}
            >
              거부됨
            </Button>
          </div>
        </div>

        {/* Documentation Feed */}
        <div className="space-y-4">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card border border-dashed rounded-lg">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">문서가 없습니다</p>
              <p className="text-sm">
                {filter === "all"
                  ? "새로운 문서가 생성되면 여기에 표시됩니다."
                  : `${filter === "pending" ? "대기 중인" : filter === "approved" ? "승인된" : "거부된"} 문서가 없습니다.`}
              </p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <PendingDocCard
                key={doc.id}
                doc={doc}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
