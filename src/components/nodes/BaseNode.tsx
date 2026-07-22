"use client"

import {
  Handle,
  Position
} from "reactflow"


import {
  useFlowStore
} from "@/store/flowStore"



export default function BaseNode({
  id,
  data
}:any){


const removeNode =
useFlowStore(
 s=>s.removeNode
)



return (

<div
className="
bg-white
border
rounded-lg
shadow-md
min-w-[180px]
"
>


<div
className="
bg-gray-900
text-white
px-3
py-2
rounded-t-lg
flex
justify-between
"
>

<span>
{data.label}
</span>


<button
onClick={()=>
 removeNode(id)
}
>
×
</button>


</div>



<div
className="
p-3
text-sm
"
>

{data.type}


</div>



<Handle
type="target"
position={Position.Left}
/>


<Handle
type="source"
position={Position.Right}
/>


</div>

)

}
