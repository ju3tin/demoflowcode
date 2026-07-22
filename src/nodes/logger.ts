import {
 NodeDefinition
} from "@/lib/types"



export const loggerNode:
NodeDefinition = {


type:
"debug.logger",


label:
"Logger",


category:
"Debug",



inputs:[
 {
  name:"value",
  type:"any"
 }
],



outputs:[
 {
  name:"done",
  type:"boolean"
 }
],



defaultConfig:{},



async execute({
 input
}){


 console.log(
  "FLOW:",
  input
 )


 return {
  done:true
 }

}


}
