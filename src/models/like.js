const { Schema, model } = require("mongoose");

// Schema
const likeSchema = new Schema({
    blogID:{
        type: Schema.Types.ObjectId,
        ref:"Blog",
        trim:true
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        trim:true
    }
});

// Model
const Like = model("Like", likeSchema);

module.exports = Like;