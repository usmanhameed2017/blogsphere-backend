const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { corsOptions, limiterOptions } = require("./config");
const { cookieParserSecret, backendUrl } = require("./constants");
const path = require("path");
const passport = require("passport");
const errorHandler = require("./middlewares/errorHandler");
require("./auth/google");

// Express app
const app = express();

// ************* MIDDLEWARES ************* //
app.use(cors(corsOptions));
app.use(rateLimit(limiterOptions));
app.use(cookieParser(cookieParserSecret));
app.use(express.urlencoded({ extended:true, limit:"20kb" }));
app.use(express.json({ limit:"20kb" }));
app.use("/public", express.static(path.resolve("public")));
app.use(passport.initialize());


// ************* ROUTES ************* //
// Imports
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const likeRouter = require("./routes/like");
const commentRouter = require("./routes/comment");

// Registered routes
app.use(`${backendUrl}/user`, userRouter);
app.use(`${backendUrl}/blog`, blogRouter);
app.use(`${backendUrl}/like`, likeRouter);
app.use(`${backendUrl}/comment`, commentRouter);

// Error handling middleware
app.use(errorHandler);

module.exports = app;