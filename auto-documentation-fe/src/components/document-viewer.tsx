"use client";

import { useState, useEffect, useRef } from "react";
import { Document } from "@/api/types";
import { useUpdateDocument, useDocumentDiff } from "@/hooks/useDocument";
import { DiffViewer } from "@/components/diff-viewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Calendar,
  GitCommit,
  X,
  Code,
  Eye,
  Edit3,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  GitCompare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

/// Mermaid 초기화
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

// Mermaid 다이어그램 컴포넌트
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart.trim()) return;

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError("다이어그램을 렌더링할 수 없습니다.");
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <p className="text-red-600 text-sm">{error}</p>
        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="bg-muted rounded-lg p-4 my-4 animate-pulse">
        <div className="h-32 bg-muted-foreground/10 rounded"></div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 p-4 bg-white rounded-lg border overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [viewMode, setViewMode] = useState<"preview" | "source" | "edit" | "diff">(
    "preview"
  );
  const [editTitle, setEditTitle] = useState(document.title);
  const [editContent, setEditContent] = useState(document.content);
  const [editStatus, setEditStatus] = useState(document.status);

  const updateDocument = useUpdateDocument();
  const { data: diffData, isLoading: isDiffLoading, error: diffError } = useDocumentDiff(
    viewMode === "diff" ? document.id : null
  );

  // document가 변경되면 편집 상태 초기화
  useEffect(() => {
    setEditTitle(document.title);
    setEditContent(document.content);
    setEditStatus(document.status);
  }, [document]);

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

  const handleSave = () => {
    const repoName = document.repository_name;
    const [repoOwner, repoNameOnly] = repoName.includes("/")
      ? repoName.split("/")
      : ["", repoName];

    // 변경된 필드만 전송
    const changes: { title?: string; content?: string; status?: string } = {};

    if (editTitle !== document.title) {
      changes.title = editTitle;
    }
    if (editContent !== document.content) {
      changes.content = editContent;
    }
    if (editStatus !== document.status) {
      changes.status = editStatus;
    }

    // 변경사항이 없으면 저장하지 않음
    if (Object.keys(changes).length === 0) {
      setViewMode("preview");
      return;
    }

    updateDocument.mutate(
      {
        documentId: document.id,
        data: changes,
        repoOwner,
        repoName: repoNameOnly,
      },
      {
        onSuccess: () => {
          setViewMode("preview");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditTitle(document.title);
    setEditContent(document.content);
    setEditStatus(document.status);
    setViewMode("preview");
  };

  const hasChanges =
    editTitle !== document.title ||
    editContent !== document.content ||
    editStatus !== document.status;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              {viewMode === "edit" ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold h-auto py-1"
                  placeholder="문서 제목"
                />
              ) : (
                <CardTitle className="text-2xl">{document.title}</CardTitle>
              )}
            </div>
            <CardDescription className="text-base">
              {document.summary}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary">
            <GitCommit className="w-3 h-3 mr-1" />
            {document.commit_sha.substring(0, 7)}
          </Badge>
          <Badge variant="outline">{document.document_type}</Badge>
          {viewMode === "edit" ? (
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="text-xs px-2 py-1 rounded border bg-background"
            >
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="edited">edited</option>
              <option value="reviewed">reviewed</option>
            </select>
          ) : (
            <Badge
              variant={
                document.status === "approved"
                  ? "default"
                  : document.status === "pending"
                  ? "secondary"
                  : "destructive"
              }
            >
              {document.status}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>생성: {formatDate(document.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>수정: {formatDate(document.updated_at)}</span>
          </div>
        </div>

        {/* 뷰 모드 토글 및 액션 버튼 */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="text-xs"
              disabled={viewMode === "edit"}
            >
              <Eye className="w-3 h-3 mr-1" />
              미리보기
            </Button>
            <Button
              variant={viewMode === "source" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("source")}
              className="text-xs"
              disabled={viewMode === "edit"}
            >
              <Code className="w-3 h-3 mr-1" />
              원본
            </Button>
            <Button
              variant={viewMode === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("edit")}
              className="text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              편집
            </Button>
            <Button
              variant={viewMode === "diff" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("diff")}
              className="text-xs"
              disabled={viewMode === "edit"}
            >
              <GitCompare className="w-3 h-3 mr-1" />
              변경내역
            </Button>
          </div>

          {viewMode === "edit" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={updateDocument.isPending}
              >
                <XCircle className="w-3 h-3 mr-1" />
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateDocument.isPending || !hasChanges}
              >
                {updateDocument.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    저장
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* 성공/에러 메시지 */}
        {updateDocument.isSuccess && (
          <div className="flex items-center gap-2 mt-3 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>문서가 성공적으로 저장되었습니다.</span>
          </div>
        )}
        {updateDocument.isError && (
          <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
            <XCircle className="w-4 h-4" />
            <span>문서 저장에 실패했습니다. 다시 시도해주세요.</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {viewMode === "edit" ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[400px] p-4 bg-muted rounded-md font-mono text-sm resize-y border-0 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="마크다운 내용을 입력하세요..."
          />
        ) : viewMode === "preview" ? (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mt-5 mb-3 pb-1 border-b">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="my-2 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside my-2 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside my-2 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="ml-2">{children}</li>,
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";

                  // Mermaid 코드 블록 처리
                  if (language === "mermaid") {
                    const chart = String(children).replace(/\n$/, "");
                    return <MermaidDiagram chart={chart} />;
                  }

                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => {
                  // Mermaid인 경우 pre 래퍼 제거
                  const child = children as React.ReactElement<{ className?: string }>;
                  if (
                    child?.props?.className?.includes("language-mermaid")
                  ) {
                    return <>{children}</>;
                  }
                  return (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm">
                      {children}
                    </pre>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-border rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2">{children}</td>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-6 border-border" />,
              }}
            >
              {document.content}
            </ReactMarkdown>
          </div>
        ) : viewMode === "diff" ? (
          <div>
            {isDiffLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">변경 내역을 불러오는 중...</span>
              </div>
            ) : diffError ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-700 text-sm">
                  변경 내역을 불러올 수 없습니다. 이전 버전이 없거나 처음 생성된 문서일 수 있습니다.
                </p>
              </div>
            ) : diffData ? (
              <DiffViewer
                diffLines={diffData.diff_lines}
                lastUpdated={diffData.last_updated}
                oldText={diffData.old_content}
                newText={diffData.new_content}
              />
            ) : (
              <div className="bg-muted rounded-lg p-4 text-center text-muted-foreground">
                변경 내역이 없습니다.
              </div>
            )}
          </div>
        ) : (
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
            {document.content}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
