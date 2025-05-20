const User = require("../models/user");

// User signup
const signup = async (request, response) => {
    try 
    {
        const user = await User.create(request.body);
        return response.status(201).json({ data:user, message:"Account has been created successfully", success:true });
    }
    catch (error) 
    {
        return response.status(500).json({ message:error.message, success:false });
    }
};

module.exports = { signup };