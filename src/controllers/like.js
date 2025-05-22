const Like = require("../models/like");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { isValidObjectId } = require("mongoose");

// Like on blog
const likeBlog = async (request, response) => {
    const { blogID } = request.body;
    const likedBy = request.user?._id;

    // Validate blog ID
    if(!blogID) throw new ApiError(404, "Blog ID is missing");
    if(!isValidObjectId(blogID)) throw new ApiError(400, "Invalid MongoDB ID");

    try 
    {
        // Check if user already liked the blog
        const like = await Like.findOne({ likedBy });
        if(like)
        {
            const unlikeBlog = await Like.findByIdAndDelete(like?._id);
            if(!unlikeBlog) throw new ApiError(500, "Error while unliking a blog");
            return response.status(200).json(new ApiResponse(200, unlikeBlog, "Blog unliked"));
        }

        request.body.likedBy = likedBy;
        const likeBlog = await Like.create(request.body);
        return response.status(200).json(new ApiResponse(200, likeBlog, "Blog liked"));
    } 
    catch(error) 
    {
        throw new ApiError(500, error.message);
    }
};

module.exports = { likeBlog };