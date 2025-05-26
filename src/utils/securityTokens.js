const jwt = require("jsonwebtoken");
const { securityTokenSecret } = require("../constants");

// Generate security token
const generateSecurityToken = (user) => {
    if(!user) return null;
    try 
    {
        return jwt.sign({ _id:user._id }, securityTokenSecret, { expiresIn:'10m' });
    } 
    catch (error) 
    {
        console.log(error.message);
        return null;
    }
}

const verifySecurityToken = (token) => {
    if(!token) return null;
    try 
    {
        return jwt.verify(token, securityTokenSecret);
    } 
    catch (error) 
    {
        console.log(error.message);
        return null;
    }
}

module.exports = { generateSecurityToken, verifySecurityToken };