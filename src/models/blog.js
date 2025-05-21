const { Schema, model } = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

// Schema
const blogSchema = new Schema({
    title:{
        type:String,
        trim:true,
        required:true
    },
    description:{
        type:String,
        trim:true,
        requried:true
    },
    coverImage:{
        type:String,
        trim:true
    },
    images:[{
            type:String,
            trim:true
    }],
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
}, { timestamps:true });

// Inject paginate plugin
blogSchema.plugin(aggregatePaginate);

// Model
const Blog = model("Blog", blogSchema);

module.exports = Blog;