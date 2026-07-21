"use client";

import { Handle, Position } from "reactflow";
import type { ReactNode } from "react";

const ACCENT: Record<string, string> = {
  contract: "#e84142",
  variable: "#3ddc97",
  struct: "#5b8def",
  mapping: "#c792ea",
  function: "#f0b429",
  modifier: "#ff8a5c",
  event: "#4fd1c5",
  note: "#5c626c",
};

interface NodeShellProps {
  kind: keyof typeof ACCENT;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  hasInput?: boolean;
  hasOutput?: boolean;
  selected?: boolean;
  width?: number;
  children?: ReactNode;
}

export function NodeShell({
  kind,
  icon,
  eyebrow,
  title,
  hasInput = true,
  hasOutput = true,
  selected,
  width = 260,
  children,
}: NodeShellProps) {
  const accent = ACCENT[kind];

  return (
    <div
      style={{ width }}
      className="rounded-xl overflow-hidden transition-shadow"
    >
      <div
        className="rounded-xl bg-[var(--bg-surface)] border"
        style={{
          borderColor: selected ? accent : "var(--border-hairline)",
          boxShadow: selected
            ? `0 0 0 1px ${accent}, 0 8px 24px -8px ${accent}55`
            : "0 4px 12px -6px rgba(0,0,0,0.4)",
        }}
      >
        {/* accent top bar */}
        <div className="h-[3px] w-full" style={{ background: accent }} />

        <div className="px-3.5 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2.5">
            <span
              className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
              style={{ background: `${accent}1a`, color: accent }}
            >
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <div
                className="text-[9.5px] font-medium uppercase tracking-wider leading-none mb-0.5"
                style={{ color: accent }}
              >
                {eyebrow}
              </div>
              <div className="text-[13px] font-medium text-[var(--text-primary)] leading-tight truncate">
                {title}
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>

      {hasInput && (
        <Handle type="target" position={Position.Left} style={{ top: 24 }} />
      )}
      {hasOutput && (
        <Handle type="source" position={Position.Right} style={{ top: 24 }} />
      )}
    </div>
  );
}
