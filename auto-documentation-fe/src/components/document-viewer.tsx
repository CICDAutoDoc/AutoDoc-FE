"use client";

import { useState } from "react";
import { Document } from "@/api/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, GitCommit, X, Code, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [viewMode, setViewMode] = useState<"preview" | "source">("preview");

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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-2xl">{document.title}</CardTitle>
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

        {/* 뷰 모드 토글 */}
        <div className="flex gap-1 mt-4 p-1 bg-muted rounded-lg w-fit">
          <Button
            variant={viewMode === "preview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("preview")}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            미리보기
          </Button>
          <Button
            variant={viewMode === "source" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("source")}
            className="text-xs"
          >
            <Code className="w-3 h-3 mr-1" />
            원본
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === "preview" ? (
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
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm">
                    {children}
                  </pre>
                ),
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
        ) : (
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
            {document.content}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
