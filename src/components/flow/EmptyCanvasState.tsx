"use client";

import { Workflow } from "lucide-react";
import { useFlowStore } from "@/lib/flow-store";
import { TEMPLATES } from "@/lib/templates";

const ICON_ACCENT = ["#e84142", "#3ddc97", "#5b8def", "#f0b429", "#c792ea", "#4fd1c5"];

export function EmptyCanvasState() {
  const loadTemplate = useFlowStore((s) => s.loadTemplate);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-y-auto py-8">
      <div className="text-center max-w-md pointer-events-auto px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-hairline)] mb-4">
          <Workflow size={20} className="text-[var(--text-tertiary)]" />
        </div>
        <h2 className="text-[15px] font-semibold mb-1.5">
          Your canvas is empty
        </h2>
        <p className="text-[12.5px] text-[var(--text-tertiary)] leading-relaxed mb-5">
          Drag nodes from the left panel to build a pipeline, ask the
          Assistant to build for you, or start from a template:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {TEMPLATES.map((t, i) => (
            <button
              key={t.key}
              onClick={() => loadTemplate(t.key)}
              className="flex items-start gap-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2.5 hover:border-[var(--border-strong)] transition-colors"
            >
              <span
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: ICON_ACCENT[i % ICON_ACCENT.length] }}
              />
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-[var(--text-primary)]">
                  {t.title}
                </div>
                <div className="text-[10.5px] text-[var(--text-tertiary)] leading-snug mt-0.5">
                  {t.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
