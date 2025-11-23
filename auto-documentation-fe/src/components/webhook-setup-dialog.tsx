"use client";

import { useState } from "react";
import { UserRepository } from "@/api/types";
import { setupRepository } from "@/api/endpoints/webhooks";
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
  onSuccess: () => void;
}

export function WebhookSetupDialog({
  repository,
  userId,
  open,
  onOpenChange,
  onSuccess,
}: WebhookSetupDialogProps) {
  const [webhookUrl, setWebhookUrl] = useState("http://15.165.120.222/github/webhook");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repository) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const [owner, name] = repository.full_name.split("/");
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }

      await setupRepository(userId, {
        repo_owner: owner,
        repo_name: name,
        access_token: accessToken,
        webhook_url: webhookUrl,
      });

      setSuccess(true);

      // 2초 후 다이얼로그 닫기 및 성공 콜백 호출
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Failed to setup webhook:", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "웹훅 설정에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setError(null);
      setSuccess(false);
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
                onChange={(e) => setWebhookUrl(e.target.value)}
                required
                disabled={loading || success}
              />
              <p className="text-xs text-muted-foreground">
                GitHub 이벤트를 수신할 엔드포인트 URL을 입력하세요.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
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
              disabled={loading || success}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading ? (
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
