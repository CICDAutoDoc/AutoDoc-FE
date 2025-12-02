"use client";

import { useState } from "react";
import { UserRepository } from "@/api/types";
import { useRepositories } from "@/hooks/useRepositories";
import { useLatestDocument } from "@/hooks/useDocument";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText } from "lucide-react";
import { DocumentViewer } from "./document-viewer";
import { RepositoryCard } from "./repository-card";

interface RepositoryListProps {
  userId: string;
}

export function RepositoryList({ userId }: RepositoryListProps) {
  const [selectedRepo, setSelectedRepo] = useState<UserRepository | null>(null);

  // React Query로 레포지토리 목록 조회
  const {
    data: repositories = [],
    isLoading: loadingRepositories,
    error: repositoriesError,
  } = useRepositories(userId);

  // 선택된 레포지토리의 최신 문서 조회
  const selectedRepoOwner = selectedRepo?.full_name.split("/")[0] || "";
  const selectedRepoName = selectedRepo?.full_name.split("/")[1] || "";

  const {
    data: selectedDocument,
    isLoading: loadingDocument,
    error: documentError,
  } = useLatestDocument(selectedRepoOwner, selectedRepoName);

  const handleRepositoryClick = (repo: UserRepository) => {
    setSelectedRepo(repo);
  };

  const handleCloseDocument = () => {
    setSelectedRepo(null);
  };

  if (loadingRepositories) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (repositoriesError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>{repositoriesError.message || "저장소 목록을 불러오는데 실패했습니다."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (repositories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            저장소가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 선택된 문서 표시 */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={handleCloseDocument}
        />
      )}

      {/* 문서 로딩 중 */}
      {loadingDocument && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-600">
              <FileText className="w-5 h-5 animate-pulse" />
              <p>문서를 불러오는 중...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 문서 로드 에러 */}
      {documentError && selectedRepo && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>
                {(documentError as any)?.response?.status === 404
                  ? "해당 저장소의 문서를 찾을 수 없습니다. 문서가 아직 생성되지 않았을 수 있습니다."
                  : documentError.message || "문서를 불러오는데 실패했습니다."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 레포지토리 목록 - 각 카드가 자체 웹훅 상태를 관리 */}
      {repositories.map((repo) => (
        <RepositoryCard
          key={repo.full_name}
          repository={repo}
          userId={userId}
          onClick={() => handleRepositoryClick(repo)}
        />
      ))}
    </div>
  );
}
