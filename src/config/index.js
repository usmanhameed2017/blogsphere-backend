const corsOptions = {
    origin:"*",
    methods:["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials:true,
    allowedHeader:["Content-Type", "Authorization"]
};

const limiterOptions = {
    windowMs: 1000 * 60 * 2, // 2 minutes
    max:20,
    handler:(_, response) => {
        return response.status(429).json({ message:"Too many request from the same IP Address!", success:false });
    }
};

const cookieOptions = {
    httpOnly:true,
    secure:true,
    maxAge: 1000 * 60 * 60 * 7, // 7 hours
    signed:true
};

module.exports = { corsOptions, limiterOptions, cookieOptions };