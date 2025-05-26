const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const fs = require("fs");
const { uploadOnCloudinary, getPublicID, deleteImageOnCloudinary } = require("../utils/cloudinary");
const { generateAccessToken } = require("../utils/auth");
const { cookieOptions } = require("../config");
const { isValidObjectId } = require("mongoose");
const shortid = require('shortid');
const OtpCode = require("../models/otpCodes");
const sendEmail = require("../service/mailer");
const { generateSecurityToken, verifySecurityToken } = require("../utils/securityTokens");
const { frontendURL } = require("../constants");

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

// Fetch single user
const fetchSingleUser = async (request, response) => {
    if(!request.params?.id) throw new ApiError(400, "User ID is missing");
    if(!isValidObjectId(request.params?.id)) throw new ApiError(400, "Invalid MongoDB ID");

    try 
    {
        const user = await User.findById(request.params.id).select("-password");
        if(!user) throw new ApiError(404, "User not found");
        return response.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
    } 
    catch (error) 
    {
        throw new ApiError(404, error.message);
    }
};

// Edit user
const editUser = async (request, response) => {
    if(!request.params?.id) throw new ApiError(400, "User ID is missing");
    if(!isValidObjectId(request.params?.id)) throw new ApiError(400, "Invalid MongoDB ID");

    try 
    {
        const user = await User.findById(request.params.id);
        if(!user) 
        {
            // If file uploaded, remove the file from the server
            if(request.file?.path && fs.existsSync(request.file?.path)) fs.unlinkSync(request.file?.path);
            throw new ApiError(404, "User not found");
        }

        // Get public ID of old profile image
        const public_id = getPublicID(user?.profile_image);
    
        // If new profile image is uploaded
        if(request.file?.path && fs.existsSync(request.file?.path))
        {
            request.body.profile_image = await uploadOnCloudinary(request.file.path);
            if(user?.profile_image && public_id) await deleteImageOnCloudinary(public_id); // Remove old profile image
        }
        else
        {
            request.body.profile_image = user?.profile_image;
        }

        const updatedUser = await User.findByIdAndUpdate(request.params.id, request.body, { new:true }).select("-password");
        return response.status(200).json(new ApiResponse(200, updatedUser, "User has been updated successfully!"))
    } 
    catch(error) 
    {
        // If file uploaded, remove the file from the server
        if(request.file?.path && fs.existsSync(request.file?.path)) fs.unlinkSync(request.file?.path);
        throw new ApiError(500, error.message);
    }

};

// Delete user
const deleteUser = async (request, response) => {
    if(!request.params?.id) throw new ApiError(400, "User ID is missing");
    if(!isValidObjectId(request.params?.id)) throw new ApiError(400, "Invalid MongoDB ID");

    try 
    {
        const user = await User.findByIdAndDelete(request.params.id).select("-password");
        if(!user) throw new ApiError(404, "User not found");
        
        const public_id = getPublicID(user?.profile_image); // Get public ID
        await deleteImageOnCloudinary(public_id); // Delete from cloudinary

        return response.status(200).json(new ApiResponse(200, user, "User has been deleted successfully!"));
    } 
    catch(error) 
    {
        throw new ApiError(500, error.message);
    }
};

// Change password
const changePassword = async (request, response) => {
    const id = request.user?._id;
    const { oldPassword, newPassword, confirmPassword } = request.body;

    try 
    {
        // Get user
        const user = await User.findById(id);
        if(!user) throw new ApiError(404, "User not found");

        // Match password
        const isMatched = await user.matchPassword(oldPassword);
        if(!isMatched) throw new ApiError(400, "Incorrect old password");

        // Compare new password and confirm password
        if(newPassword !== confirmPassword) throw new ApiError(400, "New password and confirm password is not identical");

        // Change password
        user.password = newPassword;
        await user.save();

        return response.status(200).json(new ApiResponse(200, null, "Password has been changed successfully"));
    } 
    catch(error) 
    {
        throw new ApiError(500 , error.message);
    }
};

// Forgot password
const forgotPassword = async (request, response) => {
    const { email } = request.body;

    try 
    {
        // Check if exist
        const user = await User.findOne({ email });
        if(!user) throw new ApiError(404, "This email does not exist");

        // Generate code
        const code = shortid.generate();

        // Insert into collection
        await OtpCode.create({ code, user:user?._id });

        // Send email
        const result = await sendEmail(email, "Password reset", `Hello ${user.fname}! Your verification code is ${code}`);
        if(!result) throw new ApiError(500, "Unable to send email");

        // Generate security token
        const token = generateSecurityToken(user);
        if(!token) throw new ApiError(400, "Unable to generate security token");

        return response.status(307)
        .cookie("stepOne", token, cookieOptions)
        .redirect(`${frontendURL}/security/verifyCode`);
    } 
    catch(error) 
    {
        throw new ApiError(404, error.message);
    }
};

// Validate step:01
const verificationCodePage = (request, response) => {
    return response.status(200).json(new ApiResponse(200, null, "Successfully redirect"));
};

// Validate verification code
const validateVerificationCode = async (request, response) => {
    try 
    {
        // Get code
        const result = await OtpCode.findOne({ code:request.body.code?.trim(), user:request._id });
        if(!result) throw new ApiError(400, "Invalid code");

        // Get user
        const user = await User.findById(request._id);
        if(!user) throw new ApiError(404, "User not found");

        // Generate security token
        const token = generateSecurityToken(user);
        if(!token) throw new ApiError(400, "Unable to generate security token");

        return response.status(307)
        .cookie("stepTwo", token, cookieOptions)
        .redirect(`${frontendURL}/security/resetPassword`);
    } 
    catch (error) 
    {
        throw new ApiError(500, error.message);
    }
};

// Reset password page
const resetPasswordPage = (request, response) => {
    return response.status(200).json(new ApiResponse(200, null, "Successfully redirect"));
}

// Reset password
const resetPassword = async (request, response) => {
    const { newPassword, confirmPassword } = request.body;
    if(newPassword !== confirmPassword) 
    throw new ApiError(400, "New password and confirm password is not identical");

    try 
    {
        const user = await User.findById(request._id);
        if(!user) throw new ApiError(404, "User not found");

        user.password = newPassword;
        await user.save();

        return response.status(200).json(new ApiResponse(200, null, "Password has been updated successfully"));
    } 
    catch(error) 
    {
        throw new ApiError(500, error.message);
    }
}

module.exports = { 
    signup, 
    login, 
    logout, 
    fetchAllUsers, 
    fetchSingleUser, 
    editUser, 
    deleteUser, 
    changePassword, 
    forgotPassword, 
    verificationCodePage,
    validateVerificationCode,
    resetPasswordPage,
    resetPassword 
};