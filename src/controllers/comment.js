const Comment = require("../models/comment");
const ApiError = require("../utils/ApiError");
const { isValidObjectId } = require("mongoose");
const ApiResponse = require("../utils/ApiResponse");

const commentOnBlog = async (request, response) => {
    const { blogID } = request.body;
    const commentedBy = request.user?._id;

    // Validate blog ID
    if(!blogID) throw new ApiError(404, "Blog ID is missing");
    if(!isValidObjectId(blogID)) throw new ApiError(400, "Invalid MongoDB ID");
    request.body.commentedBy = commentedBy;

    try 
    {
        const comment = await Comment.create(request.body);
        return response.status(200).json(new ApiResponse(200, comment, "Comment has been posted successfully"));
    } 
    catch(error) 
    {
        throw new ApiError(500, error.message);
    }
};

module.exports = { commentOnBlog };