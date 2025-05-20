const jwt = require("jsonwebtoken");
const { accessTokenSecret, accessTokenExpiry } = require("../constants");

// Generate access token
const generateAccessToken = (user) => {
    if(!user) return null;

    // User payload
    const payload = {
        _id:user._id,
        fname:user.fname,
        email:user.email,
        username:user.username
    };

    try 
    {
        return jwt.sign(payload, accessTokenSecret, accessTokenExpiry);
    } 
    catch(error) 
    {
        console.log(error.message);
        return null;
    }
};

module.exports = { generateAccessToken };