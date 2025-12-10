"use client";

import { UserRepository, Webhook } from "@/api/types";
import { useSetupWebhook, useDeleteWebhook } from "@/hooks/useWebhooks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Unlock,
  GitBranch,
  FileText,
  Webhook as WebhookIcon,
  Loader2,
  Trash2,
  Plus,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface RepositoryCardProps {
  repository: UserRepository;
  userId: string;
  webhooks?: Webhook[];
  loadingWebhooks?: boolean;
  onClick: () => void;
}

export function RepositoryCard({
  repository,
  userId,
  webhooks: repoWebhooks = [],
  loadingWebhooks = false,
  onClick,
}: RepositoryCardProps) {
  const webhookUrl = "http://15.165.120.222";
  const [owner, name] = repository.full_name.split("/");

  const setupWebhook = useSetupWebhook();
  const deleteWebhook = useDeleteWebhook();

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
      className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer rounded-xl border-border/50 hover:border-primary/30 overflow-hidden"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* 왼쪽: 레포 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {repository.name}
              </h3>
              <Badge
                variant="outline"
                className={`shrink-0 text-xs ${repository.private
                    ? "border-amber-300 text-amber-600 bg-amber-50"
                    : "border-emerald-300 text-emerald-600 bg-emerald-50"
                  }`}
              >
                {repository.private ? (
                  <Lock className="w-3 h-3 mr-1" />
                ) : (
                  <Unlock className="w-3 h-3 mr-1" />
                )}
                {repository.private ? "Private" : "Public"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                {owner}
              </span>
              <span className="flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" />
                {repository.default_branch}
              </span>
              {loadingWebhooks ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  로딩 중
                </span>
              ) : (
                <span
                  className={`flex items-center gap-1 ${activeWebhooks.length > 0
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                    }`}
                >
                  <WebhookIcon className="w-3.5 h-3.5" />
                  {activeWebhooks.length > 0
                    ? `웹훅 활성`
                    : hasWebhooks
                      ? "웹훅 비활성"
                      : "웹훅 없음"}
                </span>
              )}
            </div>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex items-center gap-2 shrink-0">
            {activeWebhooks.length === 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSetupWebhook}
                disabled={isProcessing || loadingWebhooks}
                className="rounded-lg shadow-sm"
              >
                {isSettingThisRepo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    설정 중
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1.5" />
                    웹훅 설정
                  </>
                )}
              </Button>
            )}
            {hasWebhooks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteWebhook}
                disabled={isProcessing || loadingWebhooks}
                className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                {isDeletingThisRepo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            )}
            <div className="flex items-center gap-1.5 text-primary pl-2 border-l border-border">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">문서</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* 상태 메시지 */}
        {(setupSuccessThisRepo || deleteSuccessThisRepo) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            {setupSuccessThisRepo
              ? "웹훅이 성공적으로 설정되었습니다"
              : "웹훅이 성공적으로 삭제되었습니다"}
          </div>
        )}
        {(setupErrorThisRepo || deleteErrorThisRepo) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            <XCircle className="w-4 h-4" />
            웹훅 작업 중 오류가 발생했습니다
          </div>
        )}
      </div>
    </Card>
  );
}
