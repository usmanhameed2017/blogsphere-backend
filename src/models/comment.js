const { Schema, model } = require("mongoose");

// Schema
const commentSchema = new Schema({
    text:{
        type:String,
        trim:true,
        required:true
    },
    blogID:{
        type:Schema.Types.ObjectId,
        ref:"Blog",
        trim:true
    },
    commentedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        trim:true
    }
}, { timestamps:true });

// Model
const Comment = model("Comment", commentSchema);

module.exports = Comment;