"use client";

import { useMemo } from "react";
import { diffLines, Change } from "diff";

interface DiffViewerProps {
  oldText: string;
  newText: string;
}

export function DiffViewer({ oldText, newText }: DiffViewerProps) {
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
