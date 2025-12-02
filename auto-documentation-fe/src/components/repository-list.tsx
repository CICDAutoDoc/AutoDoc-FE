"use client";

import { useState, useMemo } from "react";
import { UserRepository } from "@/api/types";
import { useRepositories } from "@/hooks/useRepositories";
import { useMultipleWebhooks, useSetupWebhook, useDeleteWebhook } from "@/hooks/useWebhooks";
import { useLatestDocument } from "@/hooks/useDocument";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lock,
  Unlock,
  GitBranch,
  AlertCircle,
  FileText,
  Webhook as WebhookIcon,
  Settings,
  Loader2,
  Trash2,
} from "lucide-react";
import { DocumentViewer } from "./document-viewer";

interface RepositoryListProps {
  userId: string;
}

export function RepositoryList({ userId }: RepositoryListProps) {
  const [selectedRepo, setSelectedRepo] = useState<UserRepository | null>(null);
  const webhookUrl = "http://15.165.120.222/github/webhook";

  const setupWebhook = useSetupWebhook();
  const deleteWebhook = useDeleteWebhook();

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
  const { data: webhooks = {} } = useMultipleWebhooks(repoList, userId);

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

  const handleSetupWebhook = (repo: UserRepository, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    const [owner, name] = repo.full_name.split("/");
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      console.error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      return;
    }

    setupWebhook.mutate({
      userId,
      data: {
        repo_owner: owner,
        repo_name: name,
        access_token: accessToken,
        webhook_url: webhookUrl,
      },
    });
  };

  const handleDeleteWebhook = (repo: UserRepository, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    const [owner, name] = repo.full_name.split("/");
    const repoWebhooks = webhooks[repo.full_name] || [];
    const targetWebhook =
      repoWebhooks.find((w) => w.active) || repoWebhooks[0];

    if (!targetWebhook) {
      return;
    }

    deleteWebhook.mutate({
      repoOwner: owner,
      repoName: name,
      webhookId: targetWebhook.id,
      userId,
    });
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

      {/* 레포지토리 목록 */}
      {repositories.map((repo) => {
        const repoWebhooks = webhooks[repo.full_name] || [];
        const activeWebhooks = repoWebhooks.filter((w) => w.active);
        const hasWebhooks = repoWebhooks.length > 0;

        const [owner, name] = repo.full_name.split("/");

        const isSettingThisRepo =
          setupWebhook.isPending &&
          setupWebhook.variables?.data.repo_owner === owner &&
          setupWebhook.variables?.data.repo_name === name;

        const isDeletingThisRepo =
          deleteWebhook.isPending &&
          deleteWebhook.variables?.repoOwner === owner &&
          deleteWebhook.variables?.repoName === name;

        const isProcessing = isSettingThisRepo || isDeletingThisRepo;

        const setupSuccessThisRepo =
          setupWebhook.isSuccess &&
          setupWebhook.variables?.data.repo_owner === owner &&
          setupWebhook.variables?.data.repo_name === name;

        const deleteSuccessThisRepo =
          deleteWebhook.isSuccess &&
          deleteWebhook.variables?.repoOwner === owner &&
          deleteWebhook.variables?.repoName === name;

        const setupErrorThisRepo =
          setupWebhook.isError &&
          setupWebhook.variables?.data.repo_owner === owner &&
          setupWebhook.variables?.data.repo_name === name;

        const deleteErrorThisRepo =
          deleteWebhook.isError &&
          deleteWebhook.variables?.repoOwner === owner &&
          deleteWebhook.variables?.repoName === name;

        return (
          <Card
            key={repo.full_name}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleRepositoryClick(repo)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold">
                    {repo.full_name}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4" />
                      {repo.default_branch}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={repo.private ? "default" : "secondary"}>
                    {repo.private ? (
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        Public
                      </span>
                    )}
                  </Badge>
                  <Badge
                    variant={
                      activeWebhooks.length > 0
                        ? "default"
                        : hasWebhooks
                        ? "outline"
                        : "destructive"
                    }
                  >
                    <span className="flex items-center gap-1">
                      <WebhookIcon className="w-3 h-3" />
                      {activeWebhooks.length > 0
                        ? `웹훅 ${activeWebhooks.length}개`
                        : hasWebhooks
                        ? "비활성"
                        : "미설정"}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground flex-1">
                  <span className="font-medium">Repository:</span> {repo.name}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleSetupWebhook(repo, e)}
                    className="text-xs"
                    disabled={isProcessing || activeWebhooks.length > 0}
                  >
                    {isSettingThisRepo ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        설정 중...
                      </>
                    ) : (
                      <>
                        <Settings className="w-3 h-3 mr-1" />
                        {activeWebhooks.length > 0 ? "이미 설정됨" : "웹훅 설정"}
                      </>
                    )}
                  </Button>
                  {hasWebhooks && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteWebhook(repo, e)}
                      className="text-xs text-red-600 hover:text-red-700"
                      disabled={isProcessing}
                    >
                      {isDeletingThisRepo ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          삭제 중...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3 mr-1" />
                          웹훅 삭제
                        </>
                      )}
                    </Button>
                  )}
                  <div className="flex items-center gap-1 text-primary text-xs">
                    <FileText className="w-4 h-4" />
                    <span>최신 문서 보기</span>
                  </div>
                </div>
              </div>
            </CardContent>
            {(setupSuccessThisRepo || deleteSuccessThisRepo) && (
              <div className="px-6 pb-4">
                <p className="text-xs text-green-600">
                  {setupSuccessThisRepo
                    ? "웹훅이 성공적으로 설정되었습니다."
                    : "웹훅이 성공적으로 삭제되었습니다."}
                </p>
              </div>
            )}
            {(setupErrorThisRepo || deleteErrorThisRepo) && (
              <div className="px-6 pb-4">
                <p className="text-xs text-red-600">
                  웹훅 작업 중 오류가 발생했습니다. 다시 시도해주세요.
                </p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
