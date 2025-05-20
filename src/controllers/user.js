const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const fs = require("fs");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { generateAccessToken } = require("../utils/auth");
const { cookieOptions } = require("../config");
const { isValidObjectId } = require("mongoose");

// User signup
const signup = async (request, response) => {
    const { email, username, password, cpassword } = request.body;

    // Identical passwords
    if(password !== cpassword) 
    {
        if(request.file?.path && fs.existsSync(request.file?.path)) fs.unlinkSync(request.file?.path);
        throw new ApiError(400, "Password & confirm password must be identical");
    }

    // If email or username exist
    const user = await User.isUserExist(email, username);
    if(user) 
    {
        if(request.file?.path && fs.existsSync(request.file?.path)) fs.unlinkSync(request.file?.path);
        throw new ApiError(400, "The email or username you entered is already exist!");
    }

    // For profile image
    const profile_image = request.file?.path || "";
    if(profile_image)
    {
        request.body.profile_image = await uploadOnCloudinary(profile_image);
    }

    // Create user
    try 
    {
        const user = await User.create(request.body);
        const userData = user.toObject();
        delete userData.password; // Exclude password
        return response.status(201).json(new ApiResponse(201, userData, "Account has been created successfully"));
    }
    catch (error) 
    {
        if(request.file?.path && fs.existsSync(request.file?.path)) fs.unlinkSync(request.file?.path);
        throw new ApiError(500, error.message);
    }
};

// User login
const login = async (request, response) => {
    const { email, username, password } = request.body;

    // At least 1 field is must
    if([email, username].every(field => field === "")) throw new ApiError(400, "Please enter email or username");

    // If email or username exist
    const user = await User.isUserExist(email, username);
    if(!user) throw new ApiError(404, "The email or username you entered does not exist!");

    // Match password
    const isMatched = await user.matchPassword(password);
    if(!isMatched) throw new ApiError(400, "Incorrect password");

    // Generate access token
    const accessToken = generateAccessToken(user);

    const userData = user.toObject();
    delete userData.password; // Exclude password

    return response.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken, user:userData }, "Login successful!"));
}

// Logout
const logout = (request, response) => {
    request.user = null;
    return response.status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, null, "User has been logged-out"));
};

// Fetch all users
const fetchAllUsers = async (request, response) => {
    const { page = 1, limit = 10 } = request.params;
    try 
    {
        // Aggregation
        const aggregate = User.aggregate([
            { $project:{ _id:1, fname:1, lname:1, age:1, gender:1, email:1, username:1, profile_image:1 } },
            { $sort:{ createdAt:-1 } }
        ]);

        // Pagination options
        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        // Execute query
        const result = await User.aggregatePaginate(aggregate, options);
        if(!result || page > result.totalPages) throw new ApiError(404, "Users not found");

        return response.status(200).json(new ApiResponse(200, result, "All users fetched"));
    } 
    catch (error) 
    {
        throw new ApiError(500, error.message);
    }
};

// Fetch all users
const fetchSingleUser = async (request, response) => {
    if(!request.params.id) throw new ApiError(400, "User id is missing");
    if(!isValidObjectId(request.params.id)) throw new ApiError(400, "Invalid MongoDB ID");

    try 
    {
        const user = await User.findById(request.params.id).select("-password");
        if(!user) throw new ApiError(404, "User not found");
        return response.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
    } 
    catch (error) 
    {
        throw new ApiError(500, error.message);
    }
};

module.exports = { signup, login, logout, fetchAllUsers, fetchSingleUser };