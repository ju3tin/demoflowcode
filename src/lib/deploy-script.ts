import type { DeployNetwork } from "@/types/flow";

export const NETWORK_CONFIG = {
  fuji: {
    name: "Avalanche Fuji Testnet",
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    explorer: "https://testnet.snowtrace.io",
    hardhatKey: "fuji",
  },
  "avalanche-mainnet": {
    name: "Avalanche C-Chain",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorer: "https://snowtrace.io",
    hardhatKey: "avalanche",
  },
} as const;

export interface BuildDeployScriptInput {
  contractName: string;
  network: DeployNetwork;
  constructorArgs?: string;
}

export function buildDeployScript({
  contractName,
  network: networkKey,
  constructorArgs,
}: BuildDeployScriptInput) {
  const network = NETWORK_CONFIG[networkKey] ?? NETWORK_CONFIG.fuji;
  const args = constructorArgs?.trim();

  const deployScript = `import { ethers } from "hardhat";

async function main() {
  const ${contractName}Factory = await ethers.getContractFactory("${contractName}");

  const contract = await ${contractName}Factory.deploy(${args ? `\n    ${args}\n  ` : ""});
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("${contractName} deployed to:", address);
  console.log("Network: ${network.name} (chainId ${network.chainId})");
  console.log("Explorer:", \`${network.explorer}/address/\${address}\`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;

  const notes = [
    `Run with: npx hardhat run scripts/deploy.ts --network ${network.hardhatKey}`,
    "Set PRIVATE_KEY in your .env before running (see .env.example).",
    `RPC: ${network.rpcUrl}`,
  ];

  return { deployScript, notes, network };
}
