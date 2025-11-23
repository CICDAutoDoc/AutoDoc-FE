"use client";

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
import { FileText, Calendar, GitCommit, X } from "lucide-react";

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
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
      </CardHeader>

      <CardContent>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md">
            {document.content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
