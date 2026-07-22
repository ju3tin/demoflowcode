import {
NodeDefinition
}
from "@/lib/types"



export const httpNode:
NodeDefinition = {


type:
"http.request",


label:
"HTTP Request",


category:
"Network",



inputs:[
 {
 name:"url",
 type:"string"
 }
],



outputs:[
 {
 name:"response",
 type:"json"
 }
],



defaultConfig:{
 method:"GET"
},



async execute({
input,
config
}){


const res =
await fetch(
 input.url,
 {
  method:
  config.method
 }
)


return {
 response:
 await res.json()
}


}



}
