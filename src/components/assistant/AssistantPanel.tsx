"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useFlowStore } from "@/lib/flow-store";
import { useDemoStore } from "@/lib/demo-store";
import { getDemoAssistantResponse } from "@/lib/demo-data";
import type {
  AssistantMessage,
  AssistantResponse,
  GraphSummaryEdge,
  GraphSummaryNode,
} from "@/types/flow";

let msgCounter = 0;
function msgId() {
  msgCounter += 1;
  return `msg-${msgCounter}`;
}

function nodeName(data: Record<string, unknown>): string | undefined {
  return typeof data.name === "string" ? data.name : undefined;
}

const SUGGESTIONS = [
  "Add an ERC20 staking contract with a 30-day lock",
  "Add a withdraw function with a reentrancy guard modifier",
  "Add an event for transfers with indexed from/to",
];

interface AssistantPanelProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function AssistantPanel({
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapsed,
}: AssistantPanelProps) {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const applyAssistantOps = useFlowStore((s) => s.applyAssistantOps);
  const demoMode = useDemoStore((s) => s.demoMode);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: msgId(),
      role: "assistant",
      text: "I can build on the canvas for you — describe a contract or feature and I'll add the nodes. Ask me questions too; I'll only touch the canvas when you want me to.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: AssistantMessage = { id: msgId(), role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      let result: AssistantResponse;

      if (demoMode) {
        result = await getDemoAssistantResponse(text);
      } else {
        const graphNodes: GraphSummaryNode[] = nodes.map((n) => ({
          id: n.id,
          type: n.type as GraphSummaryNode["type"],
          name: nodeName(n.data as unknown as Record<string, unknown>),
        }));
        const graphEdges: GraphSummaryEdge[] = edges.map((e) => ({
          source: e.source,
          target: e.target,
        }));

        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.text })),
            graph: { nodes: graphNodes, edges: graphEdges },
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? `Request failed (${res.status})`);
        }

        result = await res.json();
      }

      if (result.ops?.length) {
        applyAssistantOps(result.ops);
      }

      setMessages((prev) => [
        ...prev,
        { id: msgId(), role: "assistant", text: result.reply, ops: result.ops },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: msgId(),
          role: "assistant",
          text: e instanceof Error ? e.message : "Something went wrong.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-[320px] max-w-[85vw] transition-transform duration-200 ease-out
          lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:transition-[width] lg:shrink-0
          ${mobileOpen ? "translate-x-0" : "translate-x-full"}
          ${collapsed ? "lg:w-14" : "lg:w-[320px]"}
          h-full border-l border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col`}
      >
        <div className="h-14 shrink-0 flex items-center gap-2 px-4 border-b border-[var(--border-hairline)]">
          <button
            onClick={onToggleCollapsed}
            className="hidden lg:flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 shrink-0 order-first"
          >
            {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--accent-signal)]/15 text-[var(--accent-signal)] shrink-0">
            <Sparkles size={14} />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold leading-tight truncate">
                AI Assistant
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] leading-tight truncate">
                Builds on the canvas, doesn&apos;t live on it
              </div>
            </div>
          )}
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {collapsed ? (
          <button
            onClick={onToggleCollapsed}
            className="hidden lg:flex flex-1 flex-col items-center justify-start pt-4 text-[var(--text-tertiary)] hover:text-[var(--accent-signal)] transition-colors"
            title="Expand AI Assistant"
          >
            <Bot size={18} />
          </button>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto thin-scroll px-3.5 py-3.5 space-y-3 min-h-0"
            >
              {messages.map((m) => (
                <div key={m.id} className="flex gap-2">
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-md shrink-0 mt-0.5 ${
                      m.role === "user"
                        ? "bg-[var(--bg-raised)] text-[var(--text-secondary)]"
                        : "bg-[var(--accent-signal)]/15 text-[var(--accent-signal)]"
                    }`}
                  >
                    {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[12px] leading-relaxed whitespace-pre-wrap ${
                        m.isError ? "text-[var(--accent-critical)]" : "text-[var(--text-primary)]"
                      }`}
                    >
                      {m.text}
                    </p>
                    {m.ops && m.ops.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--accent-signal)]">
                        <Wand2 size={10} />
                        {m.ops.filter((o) => o.op === "add_node").length} node
                        {m.ops.filter((o) => o.op === "add_node").length === 1 ? "" : "s"} added to canvas
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md shrink-0 bg-[var(--accent-signal)]/15 text-[var(--accent-signal)]">
                    <Bot size={12} />
                  </span>
                  <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-tertiary)] pt-1">
                    <Loader2 size={12} className="animate-spin" />
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="px-3.5 pb-2 flex flex-col gap-1.5 shrink-0">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-[11px] text-[var(--text-secondary)] bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-lg px-2.5 py-1.5 hover:border-[var(--border-strong)] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="shrink-0 border-t border-[var(--border-hairline)] p-3 flex items-end gap-2"
            >
              <textarea
                className="nodrag flex-1 resize-none text-[12px] bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-lg px-2.5 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-signal)] max-h-24"
                rows={2}
                value={input}
                placeholder="Ask the assistant to build something…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent-signal)] text-[var(--bg-void)] disabled:opacity-40 shrink-0"
              >
                <Send size={13} />
              </button>
            </form>
          </>
        )}
      </aside>
    </>
  );
}
