const { signup } = require("../controllers/user");
const userRouter = require("express").Router();

// User signup
userRouter.route("/").post(signup);

module.exports = userRouter;