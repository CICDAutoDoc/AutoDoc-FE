"use client";

import { useState, useEffect } from "react";
import { UserRepository } from "@/api/types";
import { useSetupWebhook } from "@/hooks/useWebhooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface WebhookSetupDialogProps {
  repository: UserRepository | null;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebhookSetupDialog({
  repository,
  userId,
  open,
  onOpenChange,
}: WebhookSetupDialogProps) {
  const webhookUrl = "http://15.165.120.222/github/webhook";
  const setupWebhook = useSetupWebhook();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repository) return;

    const [owner, name] = repository.full_name.split("/");
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      console.error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      return;
    }

    setupWebhook.mutate(
      {
        userId,
        data: {
          repo_owner: owner,
          repo_name: name,
          access_token: accessToken,
          webhook_url: webhookUrl,
        },
      },
      {
        onSuccess: () => {
          // 2초 후 다이얼로그 닫기
          setTimeout(() => {
            onOpenChange(false);
            setupWebhook.reset();
          }, 2000);
        },
      }
    );
  };

  // 다이얼로그가 닫힐 때 mutation 상태 리셋
  useEffect(() => {
    if (!open) {
      setupWebhook.reset();
    }
  }, [open, setupWebhook]);

  const handleClose = () => {
    if (!setupWebhook.isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>웹훅 설정</DialogTitle>
            <DialogDescription>
              {repository?.full_name}에 웹훅을 설정합니다. push 및 pull_request
              이벤트가 자동으로 구독됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="webhook-url">웹훅 URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://api.example.com/webhook"
                value={webhookUrl}
                required
                disabled={setupWebhook.isPending || setupWebhook.isSuccess}
              />
              <p className="text-xs text-muted-foreground">
                GitHub 이벤트를 수신할 엔드포인트 URL을 입력하세요.
              </p>
            </div>

            {setupWebhook.isError && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>
                  {(setupWebhook.error as any)?.response?.data?.detail ||
                    (setupWebhook.error as any)?.response?.data?.message ||
                    setupWebhook.error?.message ||
                    "웹훅 설정에 실패했습니다."}
                </p>
              </div>
            )}

            {setupWebhook.isSuccess && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-md">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <p>웹훅이 성공적으로 설정되었습니다!</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={setupWebhook.isPending || setupWebhook.isSuccess}
            >
              취소
            </Button>
            <Button type="submit" disabled={setupWebhook.isPending || setupWebhook.isSuccess}>
              {setupWebhook.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  설정 중...
                </>
              ) : (
                "설정하기"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
