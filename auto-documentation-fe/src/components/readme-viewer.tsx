"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReadmeViewerProps {
  content: string;
}

export function ReadmeViewer({ content }: ReadmeViewerProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>README</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                />
              ),
              img: ({ node, ...props }) => (
                <img {...props} className="max-w-full h-auto rounded-lg" />
              ),
              code: ({ node, inline, ...props }: any) =>
                inline ? (
                  <code
                    {...props}
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                  />
                ) : (
                  <code
                    {...props}
                    className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono"
                  />
                ),
              pre: ({ node, ...props }) => (
                <pre {...props} className="bg-muted p-4 rounded-lg overflow-x-auto" />
              ),
              h1: ({ node, ...props }) => (
                <h1 {...props} className="text-3xl font-bold mt-6 mb-4" />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="text-2xl font-bold mt-5 mb-3" />
              ),
              h3: ({ node, ...props }) => (
                <h3 {...props} className="text-xl font-bold mt-4 mb-2" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc list-inside my-4 space-y-2" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal list-inside my-4 space-y-2" />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  {...props}
                  className="border-l-4 border-muted-foreground/20 pl-4 italic my-4"
                />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4">
                  <table {...props} className="min-w-full divide-y divide-border" />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th {...props} className="px-4 py-2 bg-muted font-semibold text-left" />
              ),
              td: ({ node, ...props }) => (
                <td {...props} className="px-4 py-2 border-t border-border" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
