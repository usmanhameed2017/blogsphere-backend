const ApiError = require("../utils/ApiError");

const errorHandler = (error, request, response, next) => {
    if(error instanceof ApiError)
    {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        const success = error.success || false;
        const stack = error.stack || "";

        return response.status(statusCode)
        .json({ statusCode, message, success, stack });
    }
};

module.exports = errorHandler;