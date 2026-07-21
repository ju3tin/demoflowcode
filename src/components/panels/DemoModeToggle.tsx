"use client";

import { Clapperboard } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";

/**
 * Recording-friendly toggle. When on, the Assistant and Audit panels use
 * scripted mock responses instead of calling the real Anthropic API —
 * same UI, same loading states, no network variance. Everything else
 * (canvas, compiler, wallet, real compile/deploy) ignores this flag.
 */
export function DemoModeToggle() {
  const demoMode = useDemoStore((s) => s.demoMode);
  const toggleDemoMode = useDemoStore((s) => s.toggleDemoMode);

  return (
    <button
      onClick={toggleDemoMode}
      title={
        demoMode
          ? "Demo Mode is on — Assistant & Audit use scripted responses"
          : "Turn on Demo Mode for scripted Assistant & Audit responses"
      }
      className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-md border transition-colors ${
        demoMode
          ? "border-[var(--accent-signal)] text-[var(--accent-signal)] bg-[var(--accent-signal)]/10"
          : "border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
      }`}
    >
      <Clapperboard size={12} />
      <span className="hidden sm:inline">Demo Mode</span>
      <span
        className={`ml-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
          demoMode ? "bg-[var(--accent-signal)]" : "bg-[var(--text-tertiary)]/40"
        }`}
      />
    </button>
  );
}
