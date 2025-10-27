"use client";

import { useState } from "react";
import { PendingDocumentation } from "@/lib/mock-data";
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
  GitCommit,
  GitBranch,
  FileCode,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Clock,
  Plus,
  Minus,
  Trash2,
  Edit,
  Save,
  Eye,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DiffViewer } from "@/components/diff-viewer";

interface PendingDocCardProps {
  doc: PendingDocumentation;
  onApprove: (id: string, editedDoc?: string) => void;
  onReject: (id: string) => void;
}

export function PendingDocCard({
  doc,
  onApprove,
  onReject,
}: PendingDocCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullDoc, setShowFullDoc] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(doc.documentation.details);
  const [viewMode, setViewMode] = useState<"diff" | "full" | "edit" | "preview">("diff");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "어제";
    return `${diffInDays}일 전`;
  };

  const getFileChangeIcon = (type: string) => {
    switch (type) {
      case "added":
        return <Plus className="w-4 h-4 text-green-500" />;
      case "modified":
        return <FileCode className="w-4 h-4 text-yellow-500" />;
      case "deleted":
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <FileCode className="w-4 h-4" />;
    }
  };

  const getFileChangeColor = (type: string) => {
    switch (type) {
      case "added":
        return "text-green-600 dark:text-green-400";
      case "modified":
        return "text-yellow-600 dark:text-yellow-400";
      case "deleted":
        return "text-red-600 dark:text-red-400";
      default:
        return "";
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowFullDoc(true);
    setViewMode("edit");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(doc.documentation.details);
    setViewMode("diff");
  };

  const handleSaveAndApprove = () => {
    onApprove(doc.id, editedContent);
    setIsEditing(false);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <img
              src={doc.repository.avatarUrl}
              alt={doc.repository.owner}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">
                  {doc.repository.fullName}
                </CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(doc.createdAt)}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 mb-2">
                <GitCommit className="w-4 h-4" />
                <span className="font-mono text-xs">{doc.commit.hash}</span>
                <GitBranch className="w-4 h-4 ml-2" />
                <span>{doc.commit.branch}</span>
              </CardDescription>
              <p className="text-sm font-medium">{doc.commit.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                by {doc.commit.author} · {new Date(doc.commit.date).toLocaleString("ko-KR")}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {!isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEdit}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  편집
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onApprove(doc.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  승인
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(doc.id)}
                >
                  <X className="w-4 h-4 mr-1" />
                  거부
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSaveAndApprove}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-1" />
                  저장 후 승인
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Documentation Summary */}
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">자동 생성된 문서 요약</h4>
          <p className="text-sm">{doc.documentation.summary}</p>
          {doc.documentation.affectedModules.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {doc.documentation.affectedModules.map((module) => (
                <Badge key={module} variant="secondary">
                  {module}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* File Changes */}
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold mb-2 hover:text-primary"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            변경된 파일 {doc.fileChanges.length}개
          </button>

          {isExpanded && (
            <div className="space-y-2 pl-6">
              {doc.fileChanges.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileChangeIcon(file.type)}
                    <span className="font-mono text-xs truncate">
                      {file.path}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getFileChangeColor(file.type)}`}
                    >
                      {file.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs ml-4">
                    {file.additions > 0 && (
                      <span className="text-green-600 dark:text-green-400">
                        +{file.additions}
                      </span>
                    )}
                    {file.deletions > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        -{file.deletions}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentation View */}
        <div>
          <button
            onClick={() => setShowFullDoc(!showFullDoc)}
            className="flex items-center gap-2 text-sm font-semibold mb-3 hover:text-primary"
          >
            {showFullDoc ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            AI 생성 문서 {isEditing && "(편집 중)"}
          </button>

          {showFullDoc && (
            <div className="space-y-3">
              {/* View Mode Tabs */}
              <div className="flex gap-2 mb-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant={viewMode === "edit" ? "default" : "outline"}
                      onClick={() => setViewMode("edit")}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      편집
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "preview" ? "default" : "outline"}
                      onClick={() => setViewMode("preview")}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      미리보기
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant={viewMode === "diff" ? "default" : "outline"}
                      onClick={() => setViewMode("diff")}
                    >
                      변경사항
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "full" ? "default" : "outline"}
                      onClick={() => setViewMode("full")}
                    >
                      전체 문서
                    </Button>
                  </>
                )}
              </div>

              {/* Content based on view mode */}
              {viewMode === "diff" && (
                <DiffViewer
                  oldText={doc.documentation.originalContent}
                  newText={doc.documentation.details}
                />
              )}

              {viewMode === "full" && (
                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none p-4 bg-muted rounded-lg">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ node, inline, ...props }: any) =>
                        inline ? (
                          <code
                            {...props}
                            className="bg-background px-1.5 py-0.5 rounded text-xs font-mono"
                          />
                        ) : (
                          <code
                            {...props}
                            className="block bg-background p-3 rounded overflow-x-auto text-xs font-mono"
                          />
                        ),
                      pre: ({ node, ...props }) => (
                        <pre
                          {...props}
                          className="bg-background p-3 rounded overflow-x-auto"
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 {...props} className="text-lg font-bold mt-4 mb-2" />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 {...props} className="text-base font-bold mt-3 mb-2" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc list-inside my-2" />
                      ),
                    }}
                  >
                    {doc.documentation.details}
                  </ReactMarkdown>
                </div>
              )}

              {viewMode === "edit" && (
                <div className="relative">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[400px] p-4 bg-muted rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="마크다운 형식으로 문서를 작성하세요..."
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                    {editedContent.length} 글자
                  </div>
                </div>
              )}

              {viewMode === "preview" && (
                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none p-4 bg-muted rounded-lg">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ node, inline, ...props }: any) =>
                        inline ? (
                          <code
                            {...props}
                            className="bg-background px-1.5 py-0.5 rounded text-xs font-mono"
                          />
                        ) : (
                          <code
                            {...props}
                            className="block bg-background p-3 rounded overflow-x-auto text-xs font-mono"
                          />
                        ),
                      pre: ({ node, ...props }) => (
                        <pre
                          {...props}
                          className="bg-background p-3 rounded overflow-x-auto"
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 {...props} className="text-lg font-bold mt-4 mb-2" />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 {...props} className="text-base font-bold mt-3 mb-2" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc list-inside my-2" />
                      ),
                    }}
                  >
                    {editedContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
