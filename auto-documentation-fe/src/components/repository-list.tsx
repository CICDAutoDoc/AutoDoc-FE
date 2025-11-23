"use client";

import { useEffect, useState } from "react";
import { UserRepository, Document } from "@/api/types";
import { getUserRepositories } from "@/api/endpoints/repositories";
import { getLatestDocument } from "@/api/endpoints/documents";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Unlock, GitBranch, AlertCircle, FileText } from "lucide-react";
import { DocumentViewer } from "./document-viewer";

interface RepositoryListProps {
  userId: string;
}

export function RepositoryList({ userId }: RepositoryListProps) {
  const [repositories, setRepositories] = useState<UserRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const repos = await getUserRepositories(userId);
        setRepositories(repos);
      } catch (err: any) {
        console.error("Failed to fetch repositories:", err);
        setError(err?.message || "저장소 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [userId]);

  const handleRepositoryClick = async (repo: UserRepository) => {
    try {
      setLoadingDocument(true);
      setDocumentError(null);

      // full_name은 "owner/repo" 형식
      const [owner, name] = repo.full_name.split("/");
      console.log("Fetching document for:", { owner, name, fullName: repo.full_name });
      const document = await getLatestDocument(owner, name);
      console.log("Document fetched:", document);
      setSelectedDocument(document);
    } catch (err: any) {
      console.error("Failed to fetch latest document:", err);
      console.error("Error details:", {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        url: err?.config?.url,
      });

      let errorMessage = "문서를 불러오는데 실패했습니다.";
      if (err?.response?.status === 404) {
        errorMessage = "해당 저장소의 문서를 찾을 수 없습니다. 문서가 아직 생성되지 않았을 수 있습니다.";
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setDocumentError(errorMessage);
      setSelectedDocument(null);
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleCloseDocument = () => {
    setSelectedDocument(null);
    setDocumentError(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
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
      {documentError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{documentError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 레포지토리 목록 */}
      {repositories.map((repo) => (
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center justify-between">
              <div>
                <span className="font-medium">Repository:</span> {repo.name}
              </div>
              <div className="flex items-center gap-1 text-primary">
                <FileText className="w-4 h-4" />
                <span className="text-xs">최신 문서 보기</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
