import FlowCanvas
from "@/components/builder/FlowCanvas"


import NodePalette
from "@/components/builder/NodePalette"



export default function BuilderPage(){


return (

<div
className="
flex
h-screen
"
>


<NodePalette />


<main
className="
flex-1
"
>

<FlowCanvas />

</main>


</div>

)

}
