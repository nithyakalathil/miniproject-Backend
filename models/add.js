const mongoose=require("mongoose")
const schema=mongoose.Schema(

    {
       
        "title": {type:String,required:true},
        "company": {type:String,required:true},
        "description": {type:String,required:true},
        "location": {type:String,required:true},
        "salary": {type:String,required:true},
        "employmentType": {type:String,required:true},
        "requirements": {type:String,required:true},
        "responsibilities": {type:String,required:true},
        "jobid":String
    }
)
let sjobmodel=mongoose.model("buses",schema)
module.exports={sjobmodel}