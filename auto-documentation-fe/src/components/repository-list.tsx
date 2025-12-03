"use client";

import { useState, useMemo } from "react";
import { UserRepository } from "@/api/types";
import { useRepositories } from "@/hooks/useRepositories";
import { useMultipleWebhooks } from "@/hooks/useWebhooks";
import { useLatestDocument } from "@/hooks/useDocument";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  FileText,
  Webhook as WebhookIcon,
  WebhookOff,
} from "lucide-react";
import { DocumentViewer } from "./document-viewer";
import { RepositoryCard } from "./repository-card";

interface RepositoryListProps {
  userId: string;
}

export function RepositoryList({ userId }: RepositoryListProps) {
  const [selectedRepo, setSelectedRepo] = useState<UserRepository | null>(null);
  const [activeTab, setActiveTab] = useState<"registered" | "unregistered">(
    "registered"
  );

  // React Query로 레포지토리 목록 조회
  const {
    data: repositories = [],
    isLoading: loadingRepositories,
    error: repositoriesError,
  } = useRepositories(userId);

  // 레포지토리 목록에서 owner/name 추출
  const repoList = useMemo(
    () =>
      repositories.map((repo) => {
        const [owner, name] = repo.full_name.split("/");
        return { owner, name };
      }),
    [repositories]
  );

  // 모든 레포지토리의 웹훅 정보 조회
  const { data: webhooksMap = {}, isLoading: loadingWebhooks } =
    useMultipleWebhooks(repoList, userId);

  // 웹훅 등록 여부에 따라 레포 분류
  const { registeredRepos, unregisteredRepos } = useMemo(() => {
    const registered: UserRepository[] = [];
    const unregistered: UserRepository[] = [];

    repositories.forEach((repo) => {
      const repoWebhooks = webhooksMap[repo.full_name] || [];
      const hasActiveWebhook = repoWebhooks.some((w) => w.active);

      if (hasActiveWebhook) {
        registered.push(repo);
      } else {
        unregistered.push(repo);
      }
    });

    return { registeredRepos: registered, unregisteredRepos: unregistered };
  }, [repositories, webhooksMap]);

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

  // 현재 탭에 표시할 레포 목록
  const currentRepos =
    activeTab === "registered" ? registeredRepos : unregisteredRepos;

  if (loadingRepositories) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
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
            <p>
              {repositoriesError.message ||
                "저장소 목록을 불러오는데 실패했습니다."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (repositories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">저장소가 없습니다.</p>
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

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={activeTab === "registered" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("registered")}
          className="gap-2"
        >
          <WebhookIcon className="w-4 h-4" />
          웹훅 등록됨
          <Badge
            variant={activeTab === "registered" ? "secondary" : "outline"}
            className="ml-1"
          >
            {loadingWebhooks ? "..." : registeredRepos.length}
          </Badge>
        </Button>
        <Button
          variant={activeTab === "unregistered" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("unregistered")}
          className="gap-2"
        >
          <WebhookOff className="w-4 h-4" />
          웹훅 미등록
          <Badge
            variant={activeTab === "unregistered" ? "secondary" : "outline"}
            className="ml-1"
          >
            {loadingWebhooks ? "..." : unregisteredRepos.length}
          </Badge>
        </Button>
      </div>

      {/* 레포지토리 목록 */}
      {loadingWebhooks ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : currentRepos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              {activeTab === "registered" ? (
                <>
                  <WebhookIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">
                    웹훅이 등록된 저장소가 없습니다
                  </p>
                  <p className="text-sm mt-1">
                    미등록 탭에서 저장소에 웹훅을 설정해보세요
                  </p>
                </>
              ) : (
                <>
                  <WebhookOff className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">
                    모든 저장소에 웹훅이 등록되어 있습니다
                  </p>
                  <p className="text-sm mt-1">
                    훌륭해요! 모든 저장소가 자동 문서화 준비가 되었습니다
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {currentRepos.map((repo) => (
            <RepositoryCard
              key={repo.full_name}
              repository={repo}
              userId={userId}
              webhooks={webhooksMap[repo.full_name] || []}
              loadingWebhooks={false}
              onClick={() => handleRepositoryClick(repo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
