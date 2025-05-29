const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { corsOptions, limiterOptions } = require("./config");
const { cookieParserSecret } = require("./constants");
const path = require("path");
const errorHandler = require("./middlewares/errorHandler");

// Express app
const app = express();

// ************* MIDDLEWARES ************* //
app.use(cors(corsOptions));
app.use(rateLimit(limiterOptions));
app.use(cookieParser(cookieParserSecret));
app.use(express.urlencoded({ extended:true, limit:"20kb" }));
app.use(express.json({ limit:"20kb" }));
app.use("/public", express.static(path.resolve("public")));


// ************* ROUTES ************* //
// Imports
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const likeRouter = require("./routes/like");
const commentRouter = require("./routes/comment");

// Registered routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/comment", commentRouter);

// Error handling middleware
app.use(errorHandler);

module.exports = app;