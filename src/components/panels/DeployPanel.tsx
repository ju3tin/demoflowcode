"use client";

import { useMemo, useState } from "react";
import {
  Hammer,
  Loader2,
  Rocket,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { useWalletStore, avalancheFuji, getViemWalletClient, getViemPublicClient } from "@/lib/wallet-store";
import type { AbiItem, CompileResponse } from "@/types/flow";

interface DeployPanelProps {
  code: string;
  contractName: string;
  disabled: boolean;
}

type Stage = "idle" | "compiling" | "compiled" | "deploying" | "confirming" | "done";

function parseArgValue(type: string, raw: string): unknown {
  const t = type.trim();
  if (t.startsWith("uint") || t.startsWith("int")) {
    return BigInt(raw.trim() || "0");
  }
  if (t === "bool") {
    return raw.trim() === "true" || raw.trim() === "1";
  }
  if (t.endsWith("[]") || t === "tuple") {
    return JSON.parse(raw);
  }
  return raw;
}

export function DeployPanel({ code, contractName, disabled }: DeployPanelProps) {
  const { address, chainId, connect, switchToFuji } = useWalletStore();
  const onFuji = chainId === avalancheFuji.id;

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [compiled, setCompiled] = useState<CompileResponse | null>(null);
  const [argValues, setArgValues] = useState<Record<string, string>>({});
  const [payableValue, setPayableValue] = useState("0");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  const constructorAbi = useMemo<AbiItem | undefined>(
    () => compiled?.abi.find((item) => item.type === "constructor"),
    [compiled]
  );
  const isPayableConstructor = constructorAbi?.stateMutability === "payable";

  async function handleCompile() {
    setStage("compiling");
    setError(null);
    setCompiled(null);
    setTxHash(null);
    setContractAddress(null);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, contractName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.details ? data.details.join("\n") : data.error ?? "Compilation failed"
        );
      }
      setCompiled(data);
      setStage("compiled");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compilation failed");
      setStage("idle");
    }
  }

  async function handleDeploy() {
    if (!compiled || !address) return;
    setError(null);
    setStage("deploying");
    try {
      const args = (constructorAbi?.inputs ?? []).map((input) =>
        parseArgValue(input.type, argValues[input.name] ?? "")
      );

      const walletClient = getViemWalletClient(address);
      const hash = await walletClient.deployContract({
        abi: compiled.abi as never,
        bytecode: compiled.bytecode,
        args,
        value: isPayableConstructor ? BigInt(payableValue || "0") : undefined,
      });
      setTxHash(hash);
      setStage("confirming");

      const publicClient = getViemPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.contractAddress) {
        setContractAddress(receipt.contractAddress);
      }
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deployment failed or was rejected");
      setStage("compiled");
    }
  }

  const canDeploy = compiled && address && onFuji && stage !== "deploying" && stage !== "confirming";

  return (
    <div className="max-w-xl space-y-4">
      {/* wallet / network gate */}
      {!address && (
        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-3.5 py-3">
          <Wallet size={15} className="text-[var(--text-tertiary)] shrink-0" />
          <p className="text-[12px] text-[var(--text-secondary)] flex-1">
            Connect a wallet to deploy to Fuji testnet.
          </p>
          <button
            onClick={connect}
            className="text-[11.5px] font-medium px-2.5 py-1.5 rounded-md bg-[var(--accent-avax)] text-white hover:bg-[var(--accent-avax)]/85 transition-colors shrink-0"
          >
            Connect
          </button>
        </div>
      )}
      {address && !onFuji && (
        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--accent-warn)]/40 bg-[var(--accent-warn)]/10 px-3.5 py-3">
          <AlertTriangle size={15} className="text-[var(--accent-warn)] shrink-0" />
          <p className="text-[12px] text-[var(--text-secondary)] flex-1">
            Wrong network — switch your wallet to Avalanche Fuji testnet.
          </p>
          <button
            onClick={switchToFuji}
            className="text-[11.5px] font-medium px-2.5 py-1.5 rounded-md bg-[var(--accent-warn)] text-[var(--bg-void)] hover:opacity-85 transition-colors shrink-0"
          >
            Switch
          </button>
        </div>
      )}

      {/* step 1: compile */}
      <div>
        <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1.5">
          1. Compile
        </div>
        <button
          onClick={handleCompile}
          disabled={disabled || stage === "compiling"}
          className="flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-md border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:opacity-40 transition-colors"
        >
          {stage === "compiling" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Hammer size={12} />
          )}
          {stage === "compiling" ? "Compiling…" : "Compile with solc"}
        </button>
        {compiled && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--accent-signal)]">
            <CheckCircle2 size={11} />
            Compiled — {compiled.abi.length} ABI entries
          </div>
        )}
        {compiled && compiled.warnings.length > 0 && (
          <div className="mt-1 text-[10.5px] text-[var(--text-tertiary)] leading-snug">
            {compiled.warnings.length} compiler warning{compiled.warnings.length === 1 ? "" : "s"} (non-blocking)
          </div>
        )}
      </div>

      {/* step 2: constructor args */}
      {compiled && (constructorAbi?.inputs?.length || isPayableConstructor) && (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1.5">
            2. Constructor arguments
          </div>
          <div className="space-y-1.5">
            {constructorAbi?.inputs?.map((input) => (
              <div key={input.name} className="flex items-center gap-2">
                <label className="text-[11px] font-mono text-[var(--text-tertiary)] w-28 shrink-0 truncate">
                  {input.name}
                  <span className="text-[var(--text-tertiary)]/60"> {input.type}</span>
                </label>
                <input
                  className="flex-1 text-[11.5px] font-mono bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-md px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                  value={argValues[input.name] ?? ""}
                  placeholder={input.type}
                  onChange={(e) =>
                    setArgValues((prev) => ({ ...prev, [input.name]: e.target.value }))
                  }
                />
              </div>
            ))}
            {isPayableConstructor && (
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-mono text-[var(--text-tertiary)] w-28 shrink-0">
                  value (AVAX)
                </label>
                <input
                  className="flex-1 text-[11.5px] font-mono bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-md px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                  value={payableValue}
                  placeholder="0"
                  onChange={(e) => setPayableValue(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* step 3: deploy */}
      {compiled && (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1.5">
            3. Deploy
          </div>
          <button
            onClick={handleDeploy}
            disabled={!canDeploy}
            className="flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-md bg-[#5b8def] text-white hover:opacity-90 disabled:opacity-40 transition-colors"
          >
            {stage === "deploying" || stage === "confirming" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Rocket size={12} />
            )}
            {stage === "deploying"
              ? "Confirm in wallet…"
              : stage === "confirming"
              ? "Waiting for confirmation…"
              : "Deploy to Fuji"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-[11.5px] text-[var(--accent-critical)] whitespace-pre-wrap">{error}</p>
      )}

      {txHash && (
        <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-3.5 py-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
            <span className="text-[var(--text-tertiary)] shrink-0">Tx:</span>
            <a
              href={`${avalancheFuji.blockExplorers.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[#5b8def] hover:underline truncate flex items-center gap-1"
            >
              {txHash}
              <ExternalLink size={10} className="shrink-0" />
            </a>
          </div>
          {contractAddress && (
            <div className="flex items-center gap-1.5 text-[11.5px]">
              <CheckCircle2 size={13} className="text-[var(--accent-signal)] shrink-0" />
              <span className="text-[var(--text-tertiary)] shrink-0">Deployed at:</span>
              <a
                href={`${avalancheFuji.blockExplorers.default.url}/address/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[var(--accent-signal)] hover:underline truncate flex items-center gap-1"
              >
                {contractAddress}
                <ExternalLink size={10} className="shrink-0" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
