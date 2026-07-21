"use client";

import { Workflow, FileCode2 } from "lucide-react";

export type MainView = "canvas" | "code";

interface ViewTabsProps {
  value: MainView;
  onChange: (v: MainView) => void;
  hasCodeIssue?: boolean;
}

export function ViewTabs({ value, onChange, hasCodeIssue }: ViewTabsProps) {
  return (
    <div className="h-10 shrink-0 flex items-center gap-1 px-3 sm:px-5 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
      <button
        onClick={() => onChange("canvas")}
        className={`flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-md transition-colors ${
          value === "canvas"
            ? "bg-[var(--bg-raised)] text-[var(--text-primary)]"
            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
        }`}
      >
        <Workflow size={12} />
        Canvas
      </button>
      <button
        onClick={() => onChange("code")}
        className={`relative flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-md transition-colors ${
          value === "code"
            ? "bg-[var(--bg-raised)] text-[var(--text-primary)]"
            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
        }`}
      >
        <FileCode2 size={12} />
        Code
        {hasCodeIssue && (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-warn)]" />
        )}
      </button>
    </div>
  );
}
