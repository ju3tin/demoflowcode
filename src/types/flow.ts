import type { Node, Edge } from "reactflow";

/* ------------------------------------------------------------------ */
/* Canvas node types — deterministic Solidity building blocks.         */
/* No node in this list makes an AI call; they only hold structured    */
/* data that the compiler (lib/compiler.ts) turns into Solidity.       */
/* ------------------------------------------------------------------ */

export type FlowNodeType =
  | "contract"
  | "variable"
  | "struct"
  | "mapping"
  | "function"
  | "modifier"
  | "event"
  | "note";

export type Visibility = "public" | "private" | "internal" | "external";
export type Mutability = "mutable" | "constant" | "immutable";
export type StateMutability = "nonpayable" | "view" | "pure" | "payable";

export interface ParamRow {
  id: string;
  name: string;
  type: string;
}

export interface StructFieldRow {
  id: string;
  name: string;
  type: string;
}

export interface EventParamRow {
  id: string;
  name: string;
  type: string;
  indexed: boolean;
}

export interface ContractNodeData {
  label: string;
  name: string;
  license: string;
  pragma: string;
  /** Comma-separated parent contracts, e.g. "ERC20, Ownable" */
  inherits: string;
  /**
   * Base constructor calls for inherited parents that need constructor args,
   * inserted verbatim into the constructor signature line, e.g.
   * `ERC20("MyToken", "MTK") Ownable(msg.sender)`. Only applies if a
   * constructor Function node is present.
   */
  baseConstructorCalls: string;
}

export interface VariableNodeData {
  label: string;
  name: string;
  varType: string;
  visibility: Visibility;
  mutability: Mutability;
  initialValue: string;
}

export interface StructNodeData {
  label: string;
  name: string;
  fields: StructFieldRow[];
}

export interface MappingNodeData {
  label: string;
  name: string;
  keyType: string;
  valueType: string;
  visibility: Visibility;
}

export interface FunctionNodeData {
  label: string;
  name: string;
  isConstructor: boolean;
  visibility: Visibility;
  stateMutability: StateMutability;
  params: ParamRow[];
  returns: ParamRow[];
  body: string;
  /**
   * Comma-separated modifier names applied verbatim, e.g. "onlyOwner".
   * Use this for inherited/built-in modifiers that don't need their own
   * Modifier node. Connected Modifier nodes are applied in addition to these.
   */
  extraModifiers: string;
}

export interface ModifierNodeData {
  label: string;
  name: string;
  params: ParamRow[];
  body: string;
}

export interface EventNodeData {
  label: string;
  name: string;
  params: EventParamRow[];
}

export interface NoteNodeData {
  label: string;
  text: string;
}

export type FlowNodeData =
  | ContractNodeData
  | VariableNodeData
  | StructNodeData
  | MappingNodeData
  | FunctionNodeData
  | ModifierNodeData
  | EventNodeData
  | NoteNodeData;

export type FlowNode = Node<FlowNodeData, FlowNodeType>;
export type FlowEdge = Edge;

/* ------------------------------------------------------------------ */
/* Compiler                                                            */
/* ------------------------------------------------------------------ */

export interface CompileResult {
  code: string;
  contractName: string;
  errors: string[];
  warnings: string[];
}

/* ------------------------------------------------------------------ */
/* AI Assistant — separate surface from the canvas. Chats with Claude  */
/* and may propose graph edits ("ops") that the canvas applies.        */
/* ------------------------------------------------------------------ */

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  ops?: CanvasOp[];
  isError?: boolean;
}

export type CanvasOp =
  | {
      op: "add_node";
      tempId: string;
      nodeType: FlowNodeType;
      data: Record<string, unknown>;
      /** id (or tempId from this same batch) of a node to link from, e.g. contract -> function */
      parentId?: string;
    }
  | { op: "add_edge"; source: string; target: string }
  | { op: "update_node"; id: string; data: Record<string, unknown> }
  | { op: "remove_node"; id: string };

export interface GraphSummaryNode {
  id: string;
  type: FlowNodeType;
  name?: string;
}

export interface GraphSummaryEdge {
  source: string;
  target: string;
}

export interface AssistantRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  graph: {
    nodes: GraphSummaryNode[];
    edges: GraphSummaryEdge[];
  };
}

export interface AssistantResponse {
  reply: string;
  ops: CanvasOp[];
}

/* ------------------------------------------------------------------ */
/* Code panel actions — explicit AI utility actions on the compiled    */
/* output, distinct from both the canvas and the assistant chat.       */
/* ------------------------------------------------------------------ */

export type AuditSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface AuditFinding {
  id: string;
  severity: AuditSeverity;
  title: string;
  description: string;
  line?: number;
  recommendation: string;
}

export interface GasFinding {
  id: string;
  title: string;
  description: string;
  estimatedSavings?: string;
}

export interface AuditRequest {
  code: string;
}

export interface AuditResponse {
  score: number;
  summary: string;
  findings: AuditFinding[];
  gasFindings: GasFinding[];
}

export interface CompileRequest {
  code: string;
  contractName: string;
}

export interface AbiParam {
  name: string;
  type: string;
  internalType?: string;
}

export interface AbiItem {
  type: string;
  name?: string;
  inputs?: AbiParam[];
  outputs?: AbiParam[];
  stateMutability?: string;
}

export interface CompileResponse {
  abi: AbiItem[];
  bytecode: `0x${string}`;
  warnings: string[];
}

export type DeployNetwork = "fuji" | "avalanche-mainnet";

export interface DeployPreviewRequest {
  code: string;
  contractName: string;
  network: DeployNetwork;
  constructorArgs?: string;
}

export interface DeployPreviewResponse {
  deployScript: string;
  abiPreview: string;
  notes: string[];
}
