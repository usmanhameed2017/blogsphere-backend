class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong!", stack = "")
    {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = statusCode < 400;

        if(stack)
        {
            this.stack = stack;
        }
        else
        {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;