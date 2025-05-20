const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const fs = require("fs");
const { uploadOnCloudinary } = require("../utils/cloudinary");

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
    const profile_image = request.body.file?.path || "";
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

module.exports = { signup };