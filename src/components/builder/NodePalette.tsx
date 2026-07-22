"use client"


import {
getAvailableNodes
}
from "@/lib/registry"



import {
useFlowStore
}
from "@/store/flowStore"



export default function NodePalette(){


const addNode =
useFlowStore(
s=>s.addNode
)



function createNode(
definition:any
){


addNode({

id:
crypto.randomUUID(),

type:
"default",

position:{
x:300,
y:200
},


data:{

label:
definition.label,

type:
definition.type,

config:
definition.defaultConfig

}

})


}



return (

<div
className="
w-64
border-r
bg-gray-50
p-4
"
>


<h2
className="
font-bold
mb-4
"
>
Nodes
</h2>



{
getAvailableNodes()
.map(node=>(


<button

key={node.type}

className="
block
w-full
text-left
p-2
mb-2
bg-white
rounded
border
hover:bg-gray-100
"

onClick={()=>
createNode(node)
}

>


{node.label}


</button>


))
}


</div>

)

}
