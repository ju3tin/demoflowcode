import { NextRequest, NextResponse } from "next/server";
import { buildDeployScript } from "@/lib/deploy-script";
import type { DeployPreviewRequest, DeployPreviewResponse } from "@/types/flow";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DeployPreviewRequest;

    if (!body?.code || !body?.contractName) {
      return NextResponse.json(
        { error: "Missing required fields: code, contractName" },
        { status: 400 }
      );
    }

    const { deployScript, notes, network } = buildDeployScript({
      contractName: body.contractName,
      network: body.network,
      constructorArgs: body.constructorArgs,
    });

    const abiPreview = `// Illustrative only — run \`npx hardhat compile\` to generate the real ABI/bytecode.
// artifacts/contracts/${body.contractName}.sol/${body.contractName}.json will contain:
{
  "contractName": "${body.contractName}",
  "abi": [ /* generated from your Solidity source at compile time */ ],
  "bytecode": "0x..."
}`;

    const response: DeployPreviewResponse = {
      deployScript,
      abiPreview,
      notes: [
        `Preview mode: no transaction is broadcast. Nothing touches ${network.name}.`,
        "Compile the contract locally (Hardhat/Foundry) to get the real ABI and bytecode before deploying.",
        ...notes,
      ],
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
