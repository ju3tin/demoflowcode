export type PortType =
  | "string"
  | "number"
  | "boolean"
  | "json"
  | "any"


export interface NodePort {
  name: string
  type: PortType
}


export interface FlowNodeData {
  label: string
  type: string
  config: Record<string, any>
}


export interface FlowNode {
  id: string
  type: string
  position: {
    x: number
    y: number
  }
  data: FlowNodeData
}


export interface FlowEdge {
  id: string
  source: string
  target: string
}


export interface Flow {
  nodes: FlowNode[]
  edges: FlowEdge[]
}


export interface NodeContext {
  input: any
  config: Record<string, any>
}


export interface NodeDefinition {

  type: string

  label: string

  category: string


  inputs: NodePort[]

  outputs: NodePort[]


  defaultConfig:
    Record<string, any>


  execute(
    ctx: NodeContext
  ): Promise<any>
}
