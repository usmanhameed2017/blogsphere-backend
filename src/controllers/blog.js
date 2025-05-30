const Blog = require("../models/blog");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadOnCloudinary, getPublicID, deleteImageOnCloudinary } = require("../utils/cloudinary");
const fs = require("fs");
const { isValidObjectId, default: mongoose, Mongoose } = require("mongoose");

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
        // Lookup for the user who created blog
        {
            $lookup:{
                from:"users",
                localField:"createdBy",
                foreignField:"_id",
                as:"createdBy",
                pipeline:[
                    {
                        $addFields:{
                            name:{
                                $concat:["$fname", " ", "$lname"]
                            }
                        }
                    },
                    { $project:{ name:1, profile_image:1 } }
                ]
            }
        },

        { $unwind: "$createdBy"  }, // Destruct createdBy array

        // Lookup for likes
        { 
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"blogID",
                as:"likes",
                pipeline:[
                    {
                        // Nested lookup
                        $lookup:{
                            from:"users",
                            localField:"likedBy",
                            foreignField:"_id",
                            as:"user",
                            pipeline:[
                                {
                                    $addFields:{
                                        name:{
                                            $concat:["$fname", " ", "$lname"]
                                        }
                                    }
                                },
                                { $project:{ name:1 } }
                            ]
                        }
                    },

                    { $unwind:"$user" }, // Destruct array
                    { $replaceRoot: { newRoot: "$user" } } // Replace user wrapper
                ]
            }
        },

        // Add field - totalLikes
        {
            $addFields:{
                totalLikes:{
                    $size:"$likes"
                }
            }
        },

        // Add field - isLiked
        {
            $addFields:{
                isLiked:{
                    $cond:{
                        if:{ $in:[request.user?._id ? new mongoose.Types.ObjectId(String(request.user?._id)) : null, "$likes._id"] },
                        then:true,
                        else:false
                    }
                }
            }
        },

        // Lookup for comments
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"blogID",
                as:"comments",
                pipeline:[
                    {
                        // Nested lookup
                        $lookup:{
                            from:"users",
                            localField:"commentedBy",
                            foreignField:"_id",
                            as:"commentedBy",
                            pipeline:[
                                {
                                    $addFields:{
                                        name:{
                                            $concat:["$fname", " ", "$lname"]
                                        }
                                    }
                                },
                                { $project:{ name:1, profile_image:1 } },
                            ]
                        }
                    },
                    { $unwind:"$commentedBy" }, // Destruct user array
                    { $sort:{ createdAt:-1 } }, // Sort comments
                ]
            }
        },

        // Add field - count of total comments
        {
            $addFields:{
                totalComments:{
                    $size:"$comments"
                }
            }
        },
        
        { $sort:{ createdAt:-1 } } // Sort blogs
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

// Fetch recent blogs
const fetchRecentBlogs = async (request, response) => {
    try 
    {
        const blogs = await Blog.aggregate([
            // Lookup for the user who created blog
            {
                $lookup:{
                    from:"users",
                    localField:"createdBy",
                    foreignField:"_id",
                    as:"createdBy",
                    pipeline:[
                        {
                            $addFields:{
                                name:{
                                    $concat:["$fname", " ", "$lname"]
                                }
                            }
                        },
                        { $project:{ name:1, profile_image:1 } }
                    ]
                }
            },
    
            { $unwind: "$createdBy"  }, // Destruct createdBy array
    
            // Lookup for likes
            { 
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"blogID",
                    as:"likes",
                    pipeline:[
                        {
                            // Nested lookup
                            $lookup:{
                                from:"users",
                                localField:"likedBy",
                                foreignField:"_id",
                                as:"user",
                                pipeline:[
                                    {
                                        $addFields:{
                                            name:{
                                                $concat:["$fname", " ", "$lname"]
                                            }
                                        }
                                    },
                                    { $project:{ name:1 } }
                                ]
                            }
                        },
    
                        { $unwind:"$user" }, // Destruct array
                        { $replaceRoot: { newRoot: "$user" } } // Replace user wrapper
                    ]
                }
            },
    
            // Add field - totalLikes
            {
                $addFields:{
                    totalLikes:{
                        $size:"$likes"
                    }
                }
            },
    
            // Add field - isLiked
            {
                $addFields:{
                    isLiked:{
                        $cond:{
                            if:{ $in:[request.user?._id ? new mongoose.Types.ObjectId(String(request.user?._id)) : null, "$likes._id"] },
                            then:true,
                            else:false
                        }
                    }
                }
            },
    
            // Lookup for comments
            {
                $lookup:{
                    from:"comments",
                    localField:"_id",
                    foreignField:"blogID",
                    as:"comments",
                    pipeline:[
                        {
                            // Nested lookup
                            $lookup:{
                                from:"users",
                                localField:"commentedBy",
                                foreignField:"_id",
                                as:"commentedBy",
                                pipeline:[
                                    {
                                        $addFields:{
                                            name:{
                                                $concat:["$fname", " ", "$lname"]
                                            }
                                        }
                                    },
                                    { $project:{ name:1, profile_image:1 } },
                                ]
                            }
                        },
                        { $unwind:"$commentedBy" }, // Destruct user array
                        { $sort:{ createdAt:-1 } }, // Sort comments
                    ]
                }
            },
    
            // Add field - count of total comments
            {
                $addFields:{
                    totalComments:{
                        $size:"$comments"
                    }
                }
            },
            
            { $limit:12 },
            { $sample:{ size:12 } } // Random blogs
        ]);
        
        return response.status(200).json(new ApiResponse(200, blogs, "Recent blogs have been fetched successfully"));
    } 
    catch(error) 
    {
        throw new ApiError(404, "Blogs not found")
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
        const blog = await Blog.aggregate([
            // Match by id
            { $match:{ _id: new mongoose.Types.ObjectId(String(id)) } },

            // Lookup for the user who created blog
            {
                $lookup:{
                    from:"users",
                    localField:"createdBy",
                    foreignField:"_id",
                    as:"createdBy",
                    pipeline:[
                        {
                            $addFields:{
                                name:{
                                    $concat:["$fname", " ", "$lname"]
                                }
                            }
                        },
                        { $project:{ name:1, profile_image:1 } }
                    ]
                }
            },

            { $unwind: "$createdBy" }, // Destruct createdBy array

            // Lookup for likes
            { 
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"blogID",
                    as:"likes",
                    pipeline:[
                        {
                            // Nested lookup
                            $lookup:{
                                from:"users",
                                localField:"likedBy",
                                foreignField:"_id",
                                as:"user",
                                pipeline:[
                                    {
                                        $addFields:{
                                            name:{
                                                $concat:["$fname", " ", "$lname"]
                                            }
                                        }
                                    },
                                    { $project:{ name:1 } }
                                ]
                            }
                        },

                        { $unwind:"$user" }, // Destruct array
                        { $replaceRoot: { newRoot: "$user" } } // Replace user wrapper
                    ]
                }
            },

            // Add field - totalLikes
            {
                $addFields:{
                    totalLikes:{
                        $size:"$likes"
                    }
                }
            },

            // Add field - isLiked
            {
                $addFields:{
                    isLiked:{
                        $cond:{
                            if:{ $in:[new mongoose.Types.ObjectId(String(request.user?._id)), "$likes._id"] },
                            then:true,
                            else:false
                        }
                    }
                }
            },

            // Lookup for comments
            {
                $lookup:{
                    from:"comments",
                    localField:"_id",
                    foreignField:"blogID",
                    as:"comments",
                    pipeline:[
                        {
                            // Nested lookup
                            $lookup:{
                                from:"users",
                                localField:"commentedBy",
                                foreignField:"_id",
                                as:"commentedBy",
                                pipeline:[
                                    {
                                        $addFields:{
                                            name:{
                                                $concat:["$fname", " ", "$lname"]
                                            }
                                        }
                                    },
                                    { $project:{ name:1, profile_image:1 } },
                                ]
                            }
                        },
                        { $unwind:"$commentedBy" }, // Destruct user array
                        { $sort:{ createdAt:-1 } }, // Sort comments
                    ]
                }
            },

            // Add field - count of total comments
            {
                $addFields:{
                    totalComments:{
                        $size:"$comments"
                    }
                }
            },
            
            { $sort:{ createdAt:-1 } } // Sort blogs
        ]);

        if(!blog.length > 0) throw new ApiError(404, "Blog not found");
        return response.status(200).json(new ApiResponse(200, blog[0], "A blog has been fetched successfully"));
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

module.exports = { createBlog, fetchAllBlogs, fetchRecentBlogs, fetchSingleBlog, editBlog, deleteBlog };