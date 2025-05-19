const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { corsOptions, limiterOptions } = require("./config");
const { cookieParserSecret } = require("./constants");
const path = require("path");
const userRouter = require("./routes/user");

// Express app
const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(rateLimit(limiterOptions));
app.use(cookieParser(cookieParserSecret));
app.use(express.urlencoded({ extended:true, limit:"20kb" }));
app.use(express.json({ limit:"20kb" }));
app.use("/public", express.static(path.resolve("public")));


// ************* ROUTES ************* //
const userRouter = require("./routes/user");
app.use("/api/v1/user", userRouter);

module.exports = app;