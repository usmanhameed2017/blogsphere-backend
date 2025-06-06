const jwt = require("jsonwebtoken");
const { accessTokenSecret, accessTokenExpiry } = require("../constants");

// Generate access token
const generateAccessToken = (user) => {
    if(!user) return null;

    // User payload
    const payload = {
        _id:user._id,
        fname:user.fname || "",
        lname:user.lname || "",
        age:user.age || "",
        gender:user.gender || "",
        email:user.email || "",
        username:user.username || "",
        profile_image:user.profile_image || "",
        role:user.role
    };

    try 
    {
        return jwt.sign(payload, accessTokenSecret, { expiresIn: accessTokenExpiry });
    } 
    catch(error) 
    {
        console.log(error.message);
        return null;
    }
};

// Verify token
const verifyToken = (token) => {
    if(!token) return null;

    try 
    {
        return jwt.verify(token, accessTokenSecret);
    } 
    catch(error) 
    {
        console.log(error.message);
        return null;
    }
}

module.exports = { generateAccessToken, verifyToken };