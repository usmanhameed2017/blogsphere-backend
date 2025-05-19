const User = require("../models/user");

// User signup
const signup = async (request, response) => {
    const { fname, lname, age, gender, email, username, password } = request.body;
    [fname, lname, age, gender, email, username, password].forEach(field => {
        if(field === "") return response.status(400).json({ message:`${field} is required`, success:false });
    });

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