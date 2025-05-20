const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// User signup
const signup = async (request, response) => {
    const { email, username, password, cpassword } = request.body;

    // Identical passwords
    if(password !== cpassword) throw new ApiError(400, "Password & confirm password must be identical");

    // If email or username exist
    const user = await User.isUserExist(email, username);
    if(user) throw new ApiError(400, "The email or username you entered is already exist!");

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
        throw new ApiError(500, error.message);
    }
};

module.exports = { signup };