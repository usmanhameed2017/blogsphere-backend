const Blog = require("../models/blog");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadOnCloudinary, getPublicID, deleteImageOnCloudinary } = require("../utils/cloudinary");
const fs = require("fs");
const { isValidObjectId } = require("mongoose")

// Create blog
const createBlog = async (request, response) => {
    // If blog posted with cover image
    const coverImage = request.files?.coverImage?.[0]?.path || "";
    if(coverImage) request.body.coverImage = await uploadOnCloudinary(coverImage);

    // If blog is posted with content images
    const images = request.files?.images?.map(image => image.path);
    console.log(images)
    if(images && Array.isArray(images) && images.length > 0)
    {
        const contentImages = [];
        for(const path of images)
        {
            contentImages.push(await uploadOnCloudinary(path));
        }
        request.body.images = contentImages;
    }
    else
    {
        request.body.images = [];
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
                if(path && fs.existsSync(path)) fs.unlinkSync(path);
            }
        }
        throw new ApiError(500, error.message);
    }
};

// Fetch all blogs
const fetchAllBlogs = async (request, response) => {
    const { page = 1, limit = 10 } = request.params;

    // Aggregation
    const aggregate = Blog.aggregate([
        { $sort:{ createdAt:-1 } }
    ]);

    // Pagination options
    const options = {
        page:parseInt(page),
        limit:parseInt(limit)
    };

    try 
    {
        const result = await Blog.aggregatePaginate(aggregate, options);
        if(!result || page > result.totalPages) throw new ApiError(404, "Blog not found");
        return response.status(200).json(new ApiResponse(200, result, "All blogs have been fetched successfully"));
    } 
    catch(error) 
    {
        throw new ApiError(404, error.message);
    }
};

// Fetch single blog
const fetchSingleBlog = async (request, response) => {
    // Extract id from route paramter
    const id = request.params?.id || "";
    if(!id) throw new ApiError(404, "Blog ID is missing");
    if(!isValidObjectId(id)) throw new ApiError(400, "Invalid MongoDB ID");

    try 
    {
        const blog = await Blog.findById(id);
        if(!blog) throw new ApiError(404, "Blog not found");
        return response.status(200).json(new ApiResponse(200, blog, "A blog has been fetched successfully"));
    } 
    catch(error) 
    {
        throw new ApiError(404, error.message);
    }
};

// Edit blog
const editBlog = async (request, response) => {
    // Extract id from route paramter
    const id = request.params?.id || "";

    // Extract uploaded cover image url
    const uploadedCoverImage = request.file?.path;

    if(!id) 
    {
        if(uploadedCoverImage && fs.existsSync(uploadedCoverImage)) fs.unlinkSync(uploadedCoverImage);
        throw new ApiError(404, "Blog ID is missing");
    }

    if(!isValidObjectId(id)) 
    {
        if(uploadedCoverImage && fs.existsSync(uploadedCoverImage)) fs.unlinkSync(uploadedCoverImage);
        throw new ApiError(400, "Invalid MongoDB ID");
    }

    try 
    {
        // Get old cover image
        const blog = await Blog.findById(id).select("coverImage");
        const oldCoverImage = blog?.coverImage;

        // If cover image is uploaded
        if(uploadedCoverImage)
        {
            request.body.coverImage = await uploadOnCloudinary(uploadedCoverImage); // New cover image added

            // Check if old cover image exist
            if(oldCoverImage)
            {
                const public_id = getPublicID(oldCoverImage);
                await deleteImageOnCloudinary(public_id); // Remove old cover image
            }
        }
        else
        {
            request.body.coverImage = oldCoverImage;
        }

        // Update blog
        const updatedBlog = await Blog.findByIdAndUpdate(id, request.body, { new:true });
        if(!updatedBlog) throw new ApiError(404, "Blog not found");
        
        return response.status(200).json(new ApiResponse(200, updatedBlog, "Blog has been updated successfully"));
    } 
    catch(error) 
    {
        if(uploadedCoverImage && fs.existsSync(uploadedCoverImage)) fs.unlinkSync(uploadedCoverImage);
        throw new ApiError(404, error.message);
    }
};

// Delete blog
const deleteBlog = async (request, response) => {
    // Extract id from route paramter
    const id = request.params?.id || "";

    if(!id) throw new ApiError(404, "Blog ID is missing");
    if(!isValidObjectId(id)) throw new ApiError(400, "Invalid MongoDB ID");

    try 
    {
        const blog = await Blog.findByIdAndDelete(id);
        if(!blog) throw new ApiError(404, "Blog not found");

        // Delete cover image from cloudinary
        const public_id = getPublicID(blog?.coverImage);
        await deleteImageOnCloudinary(public_id);
        return response.status(200).json(new ApiResponse(200, blog, "Blog has been deleted successfully"));
    } 
    catch(error) 
    {
        throw new ApiError(500, error.message);
    }
};

module.exports = { createBlog, fetchAllBlogs, fetchSingleBlog, editBlog, deleteBlog };