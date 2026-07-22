"use client"


import {
useCallback
} from "react"


import ReactFlow,
{
Background,
Controls,
MiniMap,
addEdge,
Connection
}
from "reactflow"


import {
useFlowStore
}
from "@/store/flowStore"


import {
nodeTypes
}
from "@/components/nodes/NodeTypes"



export default function FlowCanvas(){


const nodes =
useFlowStore(
s=>s.nodes
)


const edges =
useFlowStore(
s=>s.edges
)


const setEdges =
useFlowStore(
s=>s.setEdges
)



const onConnect =
useCallback(
(connection:Connection)=>{


setEdges(
addEdge(
connection,
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
