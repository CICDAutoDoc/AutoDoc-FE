"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // GitHub에서 리디렉트로 전달한 code 파라미터 읽기
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError(`인증 실패: ${errorParam}`);
        setTimeout(() => {
          router.push("/");
        }, 3000);
        return;
      }

      // code 파라미터 확인
      if (!code) {
        setError("인증 코드가 없습니다.");
        setTimeout(() => {
          router.push("/");
        }, 3000);
        return;
      }

      try {
        // 백엔드로 code를 전달하여 토큰과 사용자 정보 받기
        await handleCallback(code, state || undefined);

        // 성공 시 메인 페이지로 리다이렉트
        router.push("/");
      } catch (err) {
        console.error("Callback processing error:", err);
        setError("인증 처리 중 오류가 발생했습니다.");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, router, handleCallback]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-600 text-lg font-semibold">{error}</div>
            <p className="text-muted-foreground">메인 페이지로 이동합니다...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div className="text-lg font-semibold">GitHub 인증 처리 중...</div>
            <p className="text-muted-foreground">잠시만 기다려주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
