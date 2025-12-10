"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRepository, DocumentListItem } from "@/api/types";
import { useRepositories } from "@/hooks/useRepositories";
import { useMultipleWebhooks } from "@/hooks/useWebhooks";
import { useDocuments, useDocument } from "@/hooks/useDocument";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  FileText,
  Webhook as WebhookIcon,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { DocumentViewer } from "./document-viewer";
import { RepositoryCard } from "./repository-card";

interface RepositoryListProps {
  userId: string;
}

export function RepositoryList({ userId }: RepositoryListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedRepo, setSelectedRepo] = useState<UserRepository | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
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

  // 선택된 레포지토리의 문서 목록 조회
  const {
    data: documents = [],
    isLoading: loadingDocuments,
    error: documentsError,
  } = useDocuments(
    selectedRepo ? { repository_name: selectedRepo.full_name } : {}
  );

  // 선택된 문서 상세 조회
  const {
    data: selectedDocument,
    isLoading: loadingDocument,
    error: documentError,
  } = useDocument(selectedDocumentId);

  // URL에서 파라미터 읽어서 상태 복원
  useEffect(() => {
    const repoParam = searchParams.get("repo");
    const docParam = searchParams.get("doc");

    if (repoParam && repositories.length > 0) {
      const repo = repositories.find((r) => r.full_name === repoParam);
      if (repo) {
        setSelectedRepo(repo);
      }
    } else if (!repoParam) {
      setSelectedRepo(null);
    }

    if (docParam) {
      setSelectedDocumentId(parseInt(docParam, 10));
    } else {
      setSelectedDocumentId(null);
    }
  }, [searchParams, repositories]);

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

  const handleRepositoryClick = (repo: UserRepository) => {
    setSelectedRepo(repo);
    setSelectedDocumentId(null);
    // URL 업데이트
    const params = new URLSearchParams(searchParams.toString());
    params.set("repo", repo.full_name);
    params.delete("doc");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDocumentClick = (doc: DocumentListItem) => {
    setSelectedDocumentId(doc.id);
    // URL 업데이트
    const params = new URLSearchParams(searchParams.toString());
    params.set("doc", doc.id.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleBackToRepoList = () => {
    setSelectedRepo(null);
    setSelectedDocumentId(null);
    // URL 초기화
    router.push("/", { scroll: false });
  };

  const handleBackToDocList = () => {
    setSelectedDocumentId(null);
    // URL에서 doc 파라미터 제거
    const params = new URLSearchParams(searchParams.toString());
    params.delete("doc");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      generated: "secondary",
      edited: "outline",
      reviewed: "default",
      failed: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="text-xs">
        {status}
      </Badge>
    );
  };

  // 현재 탭에 표시할 레포 목록
  const currentRepos =
    activeTab === "registered" ? registeredRepos : unregisteredRepos;

  if (loadingRepositories) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  if (repositoriesError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 rounded-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">
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
      <Card className="rounded-xl">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">저장소가 없습니다</p>
            <p className="text-sm mt-1">
              GitHub에서 저장소를 생성해보세요
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 문서 상세 보기 화면
  if (selectedDocument && selectedDocumentId) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={handleBackToDocList}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          문서 목록으로
        </Button>
        <DocumentViewer
          document={selectedDocument}
          onClose={handleBackToDocList}
          userId={userId}
        />
      </div>
    );
  }

  // 문서 목록 보기 화면
  if (selectedRepo) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleBackToRepoList}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            저장소 목록
          </Button>
          <div className="h-6 w-px bg-border" />
          <h2 className="text-lg font-semibold">{selectedRepo.full_name}</h2>
        </div>

        {/* 문서 로딩 중 */}
        {loadingDocuments && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        )}

        {/* 문서 목록 에러 */}
        {documentsError && (
          <Card className="border-destructive/30 bg-destructive/5 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">
                  문서 목록을 불러오는데 실패했습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 문서 로딩 중 (상세) */}
        {loadingDocument && selectedDocumentId && (
          <Card className="border-primary/30 bg-primary/5 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-primary">
                <FileText className="w-5 h-5 animate-pulse" />
                <p className="font-medium">문서를 불러오는 중...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 문서 상세 에러 */}
        {documentError && selectedDocumentId && (
          <Card className="border-destructive/30 bg-destructive/5 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">
                  문서를 불러오는데 실패했습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 문서 목록 */}
        {!loadingDocuments && documents.length === 0 && (
          <Card className="border-dashed border-2 rounded-xl">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">문서가 없습니다</p>
                <p className="text-sm mt-1">
                  웹훅 이벤트가 발생하면 자동으로 문서가 생성됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loadingDocuments && documents.length > 0 && (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="rounded-xl cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                onClick={() => handleDocumentClick(doc)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <h3 className="font-medium truncate">{doc.title}</h3>
                        {getStatusBadge(doc.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.content.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 저장소 목록 화면
  return (
    <div className="space-y-5">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "registered" ? "default" : "ghost"}
          onClick={() => setActiveTab("registered")}
          className={`rounded-full gap-2 transition-all ${activeTab === "registered"
            ? "shadow-md shadow-primary/20"
            : "hover:bg-muted"
            }`}
        >
          {activeTab === "registered" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          웹훅 등록됨
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === "registered"
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
              }`}
          >
            {loadingWebhooks ? "..." : registeredRepos.length}
          </span>
        </Button>
        <Button
          variant={activeTab === "unregistered" ? "default" : "ghost"}
          onClick={() => setActiveTab("unregistered")}
          className={`rounded-full gap-2 transition-all ${activeTab === "unregistered"
            ? "shadow-md shadow-primary/20"
            : "hover:bg-muted"
            }`}
        >
          {activeTab === "unregistered" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          웹훅 미등록
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === "unregistered"
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
              }`}
          >
            {loadingWebhooks ? "..." : unregisteredRepos.length}
          </span>
        </Button>
      </div>

      {/* 레포지토리 목록 */}
      {loadingWebhooks ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : currentRepos.length === 0 ? (
        <Card className="border-dashed border-2 rounded-xl">
          <CardContent className="py-16">
            <div className="text-center text-muted-foreground">
              {activeTab === "registered" ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <WebhookIcon className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">
                    웹훅이 등록된 저장소가 없습니다
                  </p>
                  <p className="text-sm mt-2 max-w-sm mx-auto">
                    미등록 탭에서 저장소에 웹훅을 설정하면 자동 문서화가
                    시작됩니다
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    모든 저장소에 웹훅이 등록되어 있습니다
                  </p>
                  <p className="text-sm mt-2 max-w-sm mx-auto">
                    훌륭해요! 모든 저장소가 자동 문서화 준비가 되었습니다
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
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
