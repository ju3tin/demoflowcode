"use client";

import {
  FileCode2,
  Box,
  Layers,
  Network,
  Zap,
  Filter,
  Bell,
  StickyNote,
  Mountain,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { FlowNodeType } from "@/types/flow";
import type { DragEvent } from "react";
import { useFlowStore } from "@/lib/flow-store";

const PALETTE: {
  type: FlowNodeType;
  label: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    type: "contract",
    label: "Contract",
    hint: "Root: name, pragma, inheritance",
    icon: <FileCode2 size={15} />,
    accent: "#e84142",
  },
  {
    type: "variable",
    label: "Variable",
    hint: "State variable declaration",
    icon: <Box size={15} />,
    accent: "#3ddc97",
  },
  {
    type: "struct",
    label: "Struct",
    hint: "Named fields grouped as a type",
    icon: <Layers size={15} />,
    accent: "#5b8def",
  },
  {
    type: "mapping",
    label: "Mapping",
    hint: "Key → value state mapping",
    icon: <Network size={15} />,
    accent: "#c792ea",
  },
  {
    type: "function",
    label: "Function",
    hint: "Signature, params, body",
    icon: <Zap size={15} />,
    accent: "#f0b429",
  },
  {
    type: "modifier",
    label: "Modifier",
    hint: "Guard condition for functions",
    icon: <Filter size={15} />,
    accent: "#ff8a5c",
  },
  {
    type: "event",
    label: "Event",
    hint: "Emittable log declaration",
    icon: <Bell size={15} />,
    accent: "#4fd1c5",
  },
  {
    type: "note",
    label: "Note",
    hint: "Freeform annotation",
    icon: <StickyNote size={15} />,
    accent: "#5c626c",
  },
];

function onDragStart(e: DragEvent<HTMLDivElement>, type: FlowNodeType) {
  e.dataTransfer.setData("application/flow-node-type", type);
  e.dataTransfer.effectAllowed = "move";
}

interface NodePaletteProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function NodePalette({
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapsed,
}: NodePaletteProps) {
  const addNodeAuto = useFlowStore((s) => s.addNodeAuto);

  function handleTapAdd(type: FlowNodeType) {
    addNodeAuto(type);
    onCloseMobile();
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
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transition-transform duration-200 ease-out
          lg:static lg:z-auto lg:translate-x-0 lg:transition-[width] lg:shrink-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "lg:w-14" : "lg:w-[210px]"}
          h-full border-r border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col`}
      >
        <div className="h-14 shrink-0 px-4 flex items-center gap-2 border-b border-[var(--border-hairline)]">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--accent-avax)]/15 text-[var(--accent-avax)] shrink-0">
            <Mountain size={15} />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1 lg:block">
              <div className="text-[13px] font-semibold leading-tight truncate">
                Flow Builder
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] leading-tight truncate">
                Avalanche C-Chain
              </div>
            </div>
          )}

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 shrink-0"
          >
            <X size={16} />
          </button>
          <button
            onClick={onToggleCollapsed}
            className="hidden lg:flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 shrink-0"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 pt-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Nodes
          </div>
        )}

        {collapsed ? (
          <div className="flex-1 overflow-y-auto thin-scroll flex flex-col items-center gap-1.5 py-3">
            {PALETTE.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
                onClick={() => handleTapAdd(item.type)}
                title={`${item.label} — ${item.hint}`}
                className="cursor-grab active:cursor-grabbing flex items-center justify-center w-9 h-9 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-raised)] hover:border-[var(--border-strong)] transition-colors shrink-0"
                style={{ color: item.accent }}
              >
                {item.icon}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 flex flex-col gap-1.5 overflow-y-auto thin-scroll flex-1">
            {PALETTE.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
                onClick={() => handleTapAdd(item.type)}
                className="group cursor-grab active:cursor-grabbing flex items-start gap-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2.5 py-2.5 hover:border-[var(--border-strong)] transition-colors"
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                  style={{ background: `${item.accent}1a`, color: item.accent }}
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-[var(--text-primary)] leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10.5px] text-[var(--text-tertiary)] leading-snug mt-0.5">
                    {item.hint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!collapsed && (
          <div className="mt-auto px-4 py-4 border-t border-[var(--border-hairline)]">
            <p className="text-[10.5px] text-[var(--text-tertiary)] leading-snug">
              Drag onto the canvas (or tap on touch devices) and connect to a
              Contract node to make them members. No AI runs on the canvas —
              ask the Assistant panel to build for you instead.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
