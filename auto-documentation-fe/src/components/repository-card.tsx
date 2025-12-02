"use client";

import { UserRepository } from "@/api/types";
import { useWebhooks, useSetupWebhook, useDeleteWebhook } from "@/hooks/useWebhooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Unlock,
  GitBranch,
  FileText,
  Webhook as WebhookIcon,
  Settings,
  Loader2,
  Trash2,
} from "lucide-react";

interface RepositoryCardProps {
  repository: UserRepository;
  userId: string;
  onClick: () => void;
}

export function RepositoryCard({ repository, userId, onClick }: RepositoryCardProps) {
  const webhookUrl = "http://15.165.120.222";
  const [owner, name] = repository.full_name.split("/");

  const setupWebhook = useSetupWebhook();
  const deleteWebhook = useDeleteWebhook();

  // 이 레포의 웹훅만 조회
  const { data: repoWebhooks = [], isLoading: loadingWebhooks } = useWebhooks(
    owner,
    name,
    userId
  );

  const activeWebhooks = repoWebhooks.filter((w) => w.active);
  const hasWebhooks = repoWebhooks.length > 0;

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

  const handleSetupWebhook = (e: React.MouseEvent) => {
    e.stopPropagation();

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

  const handleDeleteWebhook = (e: React.MouseEvent) => {
    e.stopPropagation();

    const targetWebhook = repoWebhooks.find((w) => w.active) || repoWebhooks[0];
    if (!targetWebhook) return;

    deleteWebhook.mutate({
      repoOwner: owner,
      repoName: name,
      webhookId: targetWebhook.id,
      userId,
    });
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold">
              {repository.full_name}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                {repository.default_branch}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={repository.private ? "default" : "secondary"}>
              {repository.private ? (
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
            {loadingWebhooks ? (
              <Badge variant="outline">
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  로딩 중
                </span>
              </Badge>
            ) : (
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
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground flex-1">
            <span className="font-medium">Repository:</span> {repository.name}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetupWebhook}
              className="text-xs"
              disabled={isProcessing || activeWebhooks.length > 0 || loadingWebhooks}
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
                onClick={handleDeleteWebhook}
                className="text-xs text-red-600 hover:text-red-700"
                disabled={isProcessing || loadingWebhooks}
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
}
