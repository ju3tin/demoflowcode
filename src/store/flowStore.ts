import {
  create
} from "zustand"


import {
  FlowNode,
  FlowEdge
} from "@/lib/types"



interface FlowState {


  nodes:FlowNode[]

  edges:FlowEdge[]


  addNode:
  (node:FlowNode)=>void


  updateNode:
  (
    id:string,
    data:any
  )=>void


  removeNode:
  (id:string)=>void


  setNodes:
  (nodes:FlowNode[])=>void


  setEdges:
  (edges:FlowEdge[])=>void

}



export const useFlowStore =
create<FlowState>((set)=>({


nodes:[],

edges:[],



addNode(node){

 set(state=>({

 nodes:[
  ...state.nodes,
  node
 ]

 }))

},



updateNode(id,data){

set(state=>({

nodes:
state.nodes.map(n=>
 n.id===id
 ?
 {
 ...n,
 data:{
 ...n.data,
 ...data
 }
 }
 :
 n
)

}))

},



removeNode(id){

set(state=>({

nodes:
state.nodes.filter(
 n=>n.id!==id
),


edges:
state.edges.filter(
 e=>
 e.source!==id &&
 e.target!==id
)


}))

},



setNodes(nodes){

set({
 nodes
})

},



setEdges(edges){

set({
 edges
})

}



}))
