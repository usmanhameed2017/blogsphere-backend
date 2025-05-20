const { signup, login } = require("../controllers/user");
const upload = require("../middlewares/multer");
const userRouter = require("express").Router();

// User signup
userRouter.route("/signup").post(upload.single("profile_image"), signup);

// User login
userRouter.route("/login").post(login);

module.exports = userRouter;