import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/** Lazily construct the Anthropic client so builds don't fail without a key. */
export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to your .env.local file."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const MODEL = "claude-sonnet-4-6";

export const AUDIT_SYSTEM_PROMPT = `You are a senior smart contract security auditor specializing in Avalanche C-Chain / EVM contracts.
Given Solidity source code, perform a security and gas-optimization review.

Look for: reentrancy, integer overflow/underflow (pre-0.8 patterns), unchecked external calls, access control gaps,
front-running risk, unbounded loops, storage packing inefficiencies, redundant SLOADs, missing events, and
Avalanche-specific considerations (block.timestamp vs block.number usage, gas costs on C-Chain).

Return ONLY valid JSON matching this exact shape, no markdown fences, no prose outside the JSON:
{
  "score": number (0-100, overall security/quality score),
  "summary": "string, 2-3 sentence overall assessment",
  "findings": [
    { "id": "string", "severity": "critical|high|medium|low|info", "title": "string", "description": "string", "line": number or null, "recommendation": "string" }
  ],
  "gasFindings": [
    { "id": "string", "title": "string", "description": "string", "estimatedSavings": "string or null" }
  ]
}`;

/* ------------------------------------------------------------------ */
/* Assistant panel — separate from the canvas. Chats with the user and */
/* may propose a batch of node/edge ops for the canvas to apply.       */
/* ------------------------------------------------------------------ */

export const ASSISTANT_SYSTEM_PROMPT = `You are the AI Assistant for a visual Solidity flow-builder targeting the Avalanche C-Chain.
You are a SEPARATE surface from the canvas: the canvas is a deterministic node graph that compiles to Solidity,
and you are a chat copilot that can propose changes to that graph. You never write raw Solidity into the chat as
the final output — you propose structured nodes instead, using the propose_canvas_changes tool.

Canvas node types and their exact data shapes:
- contract: { name: string, license: string (e.g. "MIT"), pragma: string (e.g. "^0.8.24"), inherits: string (comma-separated, e.g. "ERC20, Ownable"), baseConstructorCalls: string (verbatim base constructor calls for parents needing args, e.g. 'ERC20("MyToken", "MTK") Ownable(msg.sender)"; only takes effect if a constructor function node exists; leave empty string if not needed) }
- variable: { name: string, varType: string (e.g. "uint256", "address", "bool"), visibility: "public"|"private"|"internal", mutability: "mutable"|"constant"|"immutable", initialValue: string }
- struct: { name: string, fields: [{ id: string, name: string, type: string }] }
- mapping: { name: string, keyType: string, valueType: string, visibility: "public"|"private"|"internal" }
- function: { name: string, isConstructor: boolean, visibility: "public"|"external"|"internal"|"private", stateMutability: "nonpayable"|"view"|"pure"|"payable", params: [{id,name,type}], returns: [{id,name,type}], body: string (raw Solidity statements, no function signature), extraModifiers: string (comma-separated built-in/inherited modifier names applied verbatim, e.g. "onlyOwner"; leave empty string if none) }
- modifier: { name: string, params: [{id,name,type}], body: string (must include "_;" where the function body runs) }
- event: { name: string, params: [{ id: string, name: string, type: string, indexed: boolean }] }
- note: { text: string }

Graph rules:
- Every non-note node must be connected as a member of exactly one contract node (contract -> node edge). Use the "parentId" field on add_node to do this automatically, or add_edge separately.
- To apply a modifier to a function, add an edge from the modifier node to the function node (source = modifier, target = function).
- Generate small, unique-ish ids for "id" fields inside data (param rows, struct fields, event params) — short strings like "p1", "p2" are fine.
- When adding new nodes with add_node, give each a unique "tempId" (e.g. "n1", "n2") — you can reference tempIds from the SAME batch as parentId/source/target, and they'll be resolved to real ids.
- When referring to EXISTING nodes already on the canvas (given to you in the graph summary), use their real id directly as parentId/source/target/id.
- Only use update_node or remove_node on ids that exist in the provided graph summary.

When the user asks you to build, add, or modify something on the canvas, call propose_canvas_changes with the ops, and
also give a short (1-3 sentence) plain-English explanation of what you did in your text reply.
When the user asks a question or wants explanation only, just reply in text — do not call the tool.
Keep replies concise. You're a copilot, not a lecturer.`;

export const ASSISTANT_TOOL = {
  name: "propose_canvas_changes",
  description:
    "Propose a batch of additions/edits to the node canvas. Only call this when the user wants something built or changed on the canvas.",
  input_schema: {
    type: "object" as const,
    properties: {
      ops: {
        type: "array" as const,
        description: "Ordered list of graph operations to apply.",
        items: {
          type: "object" as const,
          properties: {
            op: {
              type: "string" as const,
              enum: ["add_node", "add_edge", "update_node", "remove_node"],
            },
            tempId: {
              type: "string" as const,
              description: "Required for add_node: a batch-local id other ops can reference.",
            },
            nodeType: {
              type: "string" as const,
              enum: [
                "contract",
                "variable",
                "struct",
                "mapping",
                "function",
                "modifier",
                "event",
                "note",
              ],
              description: "Required for add_node.",
            },
            data: {
              type: "object" as const,
              description: "Required for add_node and update_node. Shape depends on nodeType, see system prompt.",
            },
            parentId: {
              type: "string" as const,
              description: "For add_node: id or tempId of the node to connect from (usually the contract).",
            },
            source: {
              type: "string" as const,
              description: "Required for add_edge: id or tempId of the source node.",
            },
            target: {
              type: "string" as const,
              description: "Required for add_edge: id or tempId of the target node.",
            },
            id: {
              type: "string" as const,
              description: "Required for update_node and remove_node: the real id of an existing node.",
            },
          },
          required: ["op"],
        },
      },
    },
    required: ["ops"],
  },
};

/** Strip accidental markdown fences and parse a JSON object from model output. */
export function parseJsonResponse<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
