"use client";

import { Plus, X } from "lucide-react";
import { SOLIDITY_TYPES } from "./fields";

interface BaseRow {
  id: string;
  name: string;
  type: string;
}

interface RowListEditorProps<T extends BaseRow> {
  label: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  newRow: () => T;
  /** Render any extra per-row controls (e.g. "indexed" checkbox) */
  renderExtra?: (row: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  datalistId: string;
}

export function RowListEditor<T extends BaseRow>({
  label,
  rows,
  onChange,
  newRow,
  renderExtra,
  datalistId,
}: RowListEditorProps<T>) {
  function updateRow(id: string, patch: Partial<T>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function removeRow(id: string) {
    onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9.5px] uppercase tracking-wide text-[var(--text-tertiary)]">
          {label}
        </span>
        <button
          onClick={() => onChange([...rows, newRow()])}
          className="nodrag flex items-center gap-0.5 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <Plus size={11} />
          Add
        </button>
      </div>

      <datalist id={datalistId}>
        {SOLIDITY_TYPES.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      {rows.length === 0 && (
        <div className="text-[10px] text-[var(--text-tertiary)] italic">none</div>
      )}

      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-1">
            <input
              className="nodrag flex-1 min-w-0 text-[10.5px] bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded px-1.5 py-0.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-strong)]"
              value={row.name}
              placeholder="name"
              onChange={(e) => updateRow(row.id, { name: e.target.value } as Partial<T>)}
            />
            <input
              className="nodrag w-[86px] shrink-0 text-[10.5px] font-mono bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded px-1.5 py-0.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-strong)]"
              value={row.type}
              placeholder="type"
              list={datalistId}
              onChange={(e) => updateRow(row.id, { type: e.target.value } as Partial<T>)}
            />
            {renderExtra?.(row, (patch) => updateRow(row.id, patch))}
            <button
              onClick={() => removeRow(row.id)}
              className="nodrag text-[var(--text-tertiary)] hover:text-[var(--accent-critical)] shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
