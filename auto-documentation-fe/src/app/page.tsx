"use client";

import { useState } from "react";
import { mockPendingDocs, mockRepositories, PendingDocumentation } from "@/lib/mock-data";
import { PendingDocCard } from "@/components/pending-doc-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle, Clock, Filter } from "lucide-react";

export default function Home() {
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
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {mockRepositories.length} 레포지토리
              </Badge>
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
