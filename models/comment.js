const {mongoose} = require("./user")

const schema = {
    comment:{
        type:String,
        require:false
    },
    createdBy:{
        type : String,
        require : true,
        ref:"blogUsers"
        
    },
    blogId:{
        type : mongoose.Schema.ObjectId,
        require : true,
        ref:"blogs"
    }
}


const commentSchema = new mongoose.Schema(schema,{timestamps:true});
const comments = mongoose.model("comments",commentSchema);

module.exports = comments;