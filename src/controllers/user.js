const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// User signup
const signup = async (request, response) => {
    try 
    {
        const user = await User.create(request.body);
        return response.status(201).json(new ApiResponse(201, user, "Account has been created successfully"));
    }
    catch (error) 
    {
        throw new ApiError(500, error.message);
    }
};

module.exports = { signup };