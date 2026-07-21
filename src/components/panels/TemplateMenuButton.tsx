"use client";

import { useState } from "react";
import { ChevronDown, FileStack } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { useFlowStore } from "@/lib/flow-store";

const ICON_ACCENT = ["#e84142", "#3ddc97", "#5b8def", "#f0b429", "#c792ea", "#4fd1c5"];

export function TemplateMenuButton({ compactLabel = false }: { compactLabel?: boolean }) {
  const [open, setOpen] = useState(false);
  const nodes = useFlowStore((s) => s.nodes);
  const loadTemplate = useFlowStore((s) => s.loadTemplate);

  function handleSelect(key: string) {
    if (
      nodes.length > 0 &&
      !window.confirm("This replaces everything on the canvas. Continue?")
    ) {
      return;
    }
    loadTemplate(key);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 sm:px-3 py-1.5 rounded-md bg-[var(--accent-avax)] text-white hover:bg-[var(--accent-avax)]/85 transition-colors"
      >
        <FileStack size={12} />
        <span className={compactLabel ? "hidden sm:inline" : ""}>Templates</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-[var(--border-hairline)] text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Starter contracts
            </div>
            <div className="max-h-[360px] overflow-y-auto thin-scroll py-1.5">
              {TEMPLATES.map((t, i) => (
                <button
                  key={t.key}
                  onClick={() => handleSelect(t.key)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[var(--bg-raised)] transition-colors flex items-start gap-2.5"
                >
                  <span
                    className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0"
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
        </>
      )}
    </div>
  );
}
