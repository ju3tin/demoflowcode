"use client";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  list?: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  mono,
  list,
}: FieldProps) {
  return (
    <label className="block mb-1.5">
      <span className="block text-[9.5px] uppercase tracking-wide text-[var(--text-tertiary)] mb-0.5">
        {label}
      </span>
      <input
        className={`nodrag w-full text-[11.5px] bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-md px-2 py-1 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-strong)] ${
          mono ? "font-mono" : ""
        }`}
        value={value}
        placeholder={placeholder}
        list={list}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="block mb-1.5">
      <span className="block text-[9.5px] uppercase tracking-wide text-[var(--text-tertiary)] mb-0.5">
        {label}
      </span>
      <select
        className="nodrag w-full text-[11.5px] bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-md px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CodeArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block mb-1.5">
      <span className="block text-[9.5px] uppercase tracking-wide text-[var(--text-tertiary)] mb-0.5">
        {label}
      </span>
      <textarea
        className="nodrag thin-scroll w-full text-[10.5px] leading-snug font-mono bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-md p-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none focus:outline-none focus:border-[var(--border-strong)]"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export const SOLIDITY_TYPES = [
  "uint256",
  "uint8",
  "int256",
  "address",
  "bool",
  "string",
  "bytes32",
  "bytes",
  "uint256[]",
  "address[]",
];
