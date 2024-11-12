const mongoose=require("mongoose")
const schema=mongoose.Schema(

    {
        "image":String,
        "sname":{type:String,required:true},
        "email":{type:String,required:true},
        "phone":{type:String,required:true},
        "gender":{type:String,required:true},
        "password":{type:String,required:true}
        
        
    }
)
let jobmodel=mongoose.model("users",schema)
module.exports={jobmodel}