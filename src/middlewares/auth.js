const ApiError = require("../utils/ApiError");
const { verifyToken } = require("../utils/auth");

const checkAuth = (request, response, next) => {
    request.user = null;

    // Extract access token
    const token = request.signedCookies?.accessToken || request.headers?.["authorization"]?.split(" ")?.[1] || null;
    if(!token) throw new ApiError(404, "Access token is missing");

    // Verify access token
    const user = verifyToken(token);
    if(!user) throw new ApiError(400, "Invalid access token");

    request.user = user || null;
    return next();
};

module.exports = { checkAuth };