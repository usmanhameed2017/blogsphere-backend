const { signup } = require("../controllers/user");
const upload = require("../middlewares/multer");
const userRouter = require("express").Router();

// User signup
userRouter.route("/").post(upload.single("profile_image"), signup);

module.exports = userRouter;