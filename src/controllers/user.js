const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const fs = require("fs");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { generateAccessToken } = require("../utils/auth");
const { cookieOptions } = require("../config");

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

module.exports = { signup, login, logout };