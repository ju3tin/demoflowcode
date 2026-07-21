import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
// solc's published types don't cover the callback-based compile() overload well,
// so we treat the module loosely and validate its output shape ourselves below.
import solc from "solc";

export const runtime = "nodejs";

interface CompileRequest {
  code: string;
  contractName: string;
}

interface SolcError {
  severity: "error" | "warning";
  formattedMessage: string;
}

function findImports(importPath: string): { contents: string } | { error: string } {
  try {
    if (importPath.startsWith("@openzeppelin/")) {
      const resolved = path.join(process.cwd(), "node_modules", importPath);
      return { contents: fs.readFileSync(resolved, "utf8") };
    }
    return { error: `File not found: ${importPath}` };
  } catch {
    return { error: `File not found: ${importPath}` };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CompileRequest;

    if (!body?.code || !body?.contractName) {
      return NextResponse.json(
        { error: "Missing required fields: code, contractName" },
        { status: 400 }
      );
    }

    const input = {
      language: "Solidity",
      sources: {
        "Contract.sol": { content: body.code },
      },
      settings: {
        outputSelection: {
          "*": { "*": ["abi", "evm.bytecode.object"] },
        },
        optimizer: { enabled: true, runs: 200 },
      },
    };

    const rawOutput = solc.compile(JSON.stringify(input), { import: findImports });
    const output = JSON.parse(rawOutput);

    const allMessages: SolcError[] = output.errors ?? [];
    const errors = allMessages.filter((e) => e.severity === "error");
    const warnings = allMessages.filter((e) => e.severity === "warning");

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Compilation failed",
          details: errors.map((e) => e.formattedMessage),
        },
        { status: 400 }
      );
    }

    const contractsInFile = output.contracts?.["Contract.sol"];
    const contract = contractsInFile?.[body.contractName];

    if (!contract) {
      const available = contractsInFile ? Object.keys(contractsInFile) : [];
      return NextResponse.json(
        {
          error: `Contract "${body.contractName}" not found in compiled output.${
            available.length ? ` Found: ${available.join(", ")}` : ""
          }`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      abi: contract.abi,
      bytecode: `0x${contract.evm.bytecode.object}`,
      warnings: warnings.map((w) => w.formattedMessage),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
