const { signup, login, logout, fetchAllUsers, fetchSingleUser } = require("../controllers/user");
const { checkAuth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const userRouter = require("express").Router();

// User signup
userRouter.route("/signup").post(upload.single("profile_image"), signup);

// User login
userRouter.route("/login").post(login);

// User logout
userRouter.route("/logout").get(checkAuth, logout);

// Fetch all users
userRouter.route("/").get(checkAuth, fetchAllUsers);

// Fetch single user
userRouter.route("/:id").get(checkAuth, fetchSingleUser);


module.exports = userRouter;