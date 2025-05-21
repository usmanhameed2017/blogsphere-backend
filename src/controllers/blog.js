const Blog = require("../models/blog");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const fs = require("fs");

// Create blog
const createBlog = async (request, response) => {
    // If blog posted with cover image
    const coverImage = request.files?.coverImage?.[0]?.path || "";
    if(coverImage) request.body.coverImage = await uploadOnCloudinary(coverImage);

    // If blog is posted with content images
    const images = request.files?.images?.map(image => image.path);
    if(images && Array.isArray(images) && images.length > 0)
    {
        const contentImages = [];
        for(const path of images)
        {
            contentImages.push(await uploadOnCloudinary(path));
        }
        request.body.images = contentImages;
    }

    // Logged-in user
    request.body.createdBy = request.user?._id;

    try 
    {
        const blog = await Blog.create(request.body);
        return response.status(201).json(new ApiResponse(201, blog, "A new blog has been created successfully!"));
    } 
    catch(error) 
    {
        if(coverImage && fs.existsSync(coverImage)) fs.unlinkSync(coverImage); // Remove cover image from server
        if(images && Array.isArray(images) && images.length > 0) // Remove content images from server
        {
            for(const path of images)
            {
                if(fs.existsSync(path)) fs.unlinkSync(path);
            }
        }
        throw new ApiError(500, error.message);
    }
}

module.exports = { createBlog };