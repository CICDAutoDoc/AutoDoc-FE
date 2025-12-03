"use client";

import { useMemo } from "react";
import { diffLines, Change } from "diff";

interface DiffViewerProps {
  oldText?: string;
  newText?: string;
  diffLines?: string[]; // 서버에서 받은 diff lines
  lastUpdated?: string;
}

// 서버에서 받은 diff_lines 파싱
function parseDiffLines(lines: string[]) {
  return lines.map((line, index) => {
    // 헤더 라인 (--- / +++ / @@)
    if (line.startsWith("---") || line.startsWith("+++")) {
      return { type: "header" as const, content: line, index };
    }
    if (line.startsWith("@@")) {
      return { type: "hunk" as const, content: line, index };
    }
    // 추가된 라인
    if (line.startsWith("+")) {
      return { type: "added" as const, content: line.slice(1), index };
    }
    // 삭제된 라인
    if (line.startsWith("-")) {
      return { type: "removed" as const, content: line.slice(1), index };
    }
    // 변경 없는 라인 (공백으로 시작하거나 그냥 텍스트)
    return { type: "unchanged" as const, content: line.startsWith(" ") ? line.slice(1) : line, index };
  });
}

// 서버 Diff Lines를 렌더링하는 컴포넌트
function ServerDiffView({ diffLines, lastUpdated }: { diffLines: string[]; lastUpdated?: string }) {
  const parsedLines = useMemo(() => parseDiffLines(diffLines), [diffLines]);

  return (
    <div className="bg-muted rounded-lg overflow-hidden">
      {lastUpdated && (
        <div className="px-4 py-2 bg-muted-foreground/10 border-b border-border text-sm text-muted-foreground">
          마지막 업데이트: {new Date(lastUpdated).toLocaleString("ko-KR")}
        </div>
      )}
      <div className="font-mono text-sm overflow-x-auto">
        {parsedLines.map((line) => {
          if (line.type === "header") {
            return (
              <div
                key={line.index}
                className="px-4 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
              >
                {line.content}
              </div>
            );
          }

          if (line.type === "hunk") {
            return (
              <div
                key={line.index}
                className="px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              >
                {line.content}
              </div>
            );
          }

          if (line.type === "added") {
            return (
              <div
                key={line.index}
                className="bg-green-500/20 border-l-4 border-green-600 px-4 py-0.5 flex"
              >
                <span className="text-green-600 mr-3 select-none font-bold">+</span>
                <span className="text-green-700 dark:text-green-300 whitespace-pre">
                  {line.content || " "}
                </span>
              </div>
            );
          }

          if (line.type === "removed") {
            return (
              <div
                key={line.index}
                className="bg-red-500/20 border-l-4 border-red-600 px-4 py-0.5 flex"
              >
                <span className="text-red-600 mr-3 select-none font-bold">-</span>
                <span className="text-red-700 dark:text-red-300 line-through whitespace-pre">
                  {line.content || " "}
                </span>
              </div>
            );
          }

          // unchanged
          return (
            <div
              key={line.index}
              className="px-4 py-0.5 text-muted-foreground flex"
            >
              <span className="mr-3 select-none opacity-50">&nbsp;</span>
              <span className="whitespace-pre">{line.content || " "}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 로컬 Diff 계산 및 렌더링 컴포넌트
function LocalDiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const changes = useMemo(() => {
    return diffLines(oldText, newText);
  }, [oldText, newText]);

  return (
    <div className="bg-muted rounded-lg overflow-hidden font-mono text-sm">
      {changes.map((change: Change, index: number) => {
        if (change.added) {
          return (
            <div
              key={index}
              className="bg-green-500/20 border-l-4 border-green-600 px-4 py-1"
            >
              {change.value.split("\n").map((line, lineIndex) => {
                if (!line && lineIndex === change.value.split("\n").length - 1) return null;
                return (
                  <div key={lineIndex} className="flex">
                    <span className="text-green-600 mr-4 select-none">+</span>
                    <span className="text-green-700 dark:text-green-300">{line || " "}</span>
                  </div>
                );
              })}
            </div>
          );
        }

        if (change.removed) {
          return (
            <div
              key={index}
              className="bg-red-500/20 border-l-4 border-red-600 px-4 py-1"
            >
              {change.value.split("\n").map((line, lineIndex) => {
                if (!line && lineIndex === change.value.split("\n").length - 1) return null;
                return (
                  <div key={lineIndex} className="flex">
                    <span className="text-red-600 mr-4 select-none">-</span>
                    <span className="text-red-700 dark:text-red-300 line-through">{line || " "}</span>
                  </div>
                );
              })}
            </div>
          );
        }

        // Unchanged lines
        return (
          <div key={index} className="px-4 py-1 text-muted-foreground">
            {change.value.split("\n").map((line, lineIndex) => {
              if (!line && lineIndex === change.value.split("\n").length - 1) return null;
              return (
                <div key={lineIndex} className="flex">
                  <span className="mr-4 select-none opacity-50"> </span>
                  <span>{line || " "}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function DiffViewer({ oldText, newText, diffLines, lastUpdated }: DiffViewerProps) {
  // 서버에서 diff_lines를 제공하면 그걸 사용
  if (diffLines && diffLines.length > 0) {
    return <ServerDiffView diffLines={diffLines} lastUpdated={lastUpdated} />;
  }

  // 그렇지 않으면 로컬에서 계산
  if (oldText !== undefined && newText !== undefined) {
    return <LocalDiffView oldText={oldText} newText={newText} />;
  }

  return (
    <div className="bg-muted rounded-lg p-4 text-center text-muted-foreground">
      변경 내역이 없습니다.
    </div>
  );
}
