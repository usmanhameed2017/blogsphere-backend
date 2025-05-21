const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { corsOptions, limiterOptions } = require("./config");
const { cookieParserSecret } = require("./constants");
const path = require("path");

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

// Registered routes
app.use("/api/v1/user", userRouter);
app.use("/api/vi/blog", blogRouter);

module.exports = app;