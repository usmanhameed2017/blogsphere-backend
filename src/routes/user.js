const { signup, login, logout } = require("../controllers/user");
const { checkAuth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const userRouter = require("express").Router();

// User signup
userRouter.route("/signup").post(upload.single("profile_image"), signup);

// User login
userRouter.route("/login").post(login);

// User logout
userRouter.route("/logout").get(checkAuth, logout);

module.exports = userRouter;