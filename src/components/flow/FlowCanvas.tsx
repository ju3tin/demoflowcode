"use client"

import {
  useCallback
} from "react"

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  applyNodeChanges,
  NodeChange
} from "reactflow"

import {
  useFlowStore
} from "@/store/flowStore"

import {
  nodeTypes
} from "@/components/nodes/NodeTypes"


export default function FlowCanvas(){

const nodes =
useFlowStore(
  s => s.nodes
)

const edges =
useFlowStore(
  s => s.edges
)


const setNodes =
useFlowStore(
  s => s.setNodes
)


const setEdges =
useFlowStore(
  s => s.setEdges
)



const onNodesChange =
useCallback(
(changes: NodeChange[])=>{

setNodes(
  applyNodeChanges(
    changes,
    nodes
  )
)

},
[nodes,setNodes]
)



const onConnect =
useCallback(
(connection:Connection)=>{

setEdges(
 addEdge(
   {
    ...connection,
    id:crypto.randomUUID()
   },
   edges
 )
)

},
[edges,setEdges]
)



return (

<div
className="
w-full
h-screen
"
>

<ReactFlow

nodes={nodes as any}

edges={edges as any}

nodeTypes={nodeTypes}

onNodesChange={onNodesChange}

onConnect={onConnect}

fitView

>

<Background />

<Controls />

<MiniMap />

</ReactFlow>


</div>

)

}
