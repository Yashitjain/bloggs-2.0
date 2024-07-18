const { mongo, Schema } = require("mongoose");
const {mongoose} = require("./user")

const schema = {
    message:{
        type:String,
        require:true
    },
    createdBy:{
        type : Schema.Types.ObjectId,
        require : true,
        ref:"blogUsers"
        
    },
    title:{
        type:String,
        require:true
    },
    thumbnail:{
        data:Buffer,
        contentType:String
    }
}


const blogSchema = new mongoose.Schema(schema,{timestamps:true});
const blogs = mongoose.model("blogs",blogSchema);

module.exports = blogs;