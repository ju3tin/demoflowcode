import {
  NodeDefinition
} from "./types"


import { httpNode } from "@/nodes/http"
import { delayNode } from "@/nodes/delay"
import { loggerNode } from "@/nodes/logger"



export const nodeRegistry:
Record<string, NodeDefinition> = {

  [httpNode.type]:
    httpNode,

  [delayNode.type]:
    delayNode,

  [loggerNode.type]:
    loggerNode

}



export function getNode(
  type:string
){

  return nodeRegistry[type]

}



export function getAvailableNodes(){

  return Object.values(
    nodeRegistry
  )

}
