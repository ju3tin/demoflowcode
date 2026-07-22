import {
NodeDefinition
}
from "@/lib/types"



export const delayNode:
NodeDefinition = {


type:
"logic.delay",


label:
"Delay",


category:
"Logic",



inputs:[
 {
 name:"value",
 type:"any"
 }
],



outputs:[
 {
 name:"result",
 type:"any"
 }
],



defaultConfig:{
 milliseconds:1000
},



async execute({
input,
config
}){


await new Promise(
resolve=>
setTimeout(
resolve,
config.milliseconds
)
)


return input


}


}
