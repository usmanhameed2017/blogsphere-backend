const { signup, login, logout, fetchAllUsers, fetchSingleUser,
editUser, deleteUser, changePassword, forgotPassword, validateVerificationCode,
resetPassword, verificationCodePage, resetPasswordPage, 
verifyAccessToken } = require("../controllers/user");

const { checkAuth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const { validateStepOne, validateStepTwo } = require("../middlewares/validateSteps");
const userRouter = require("express").Router();

// User signup
userRouter.route("/signup").post(upload.single("profile_image"), signup);

// User login
userRouter.route("/login").post(login);

// Verify access token
userRouter.route("/verifyAccessToken").get(checkAuth, verifyAccessToken);

// User logout
userRouter.route("/logout").get(checkAuth, logout);

// Fetch all users
userRouter.route("/").get(checkAuth, fetchAllUsers);

userRouter.route("/:id")
.get(checkAuth, fetchSingleUser) // Fetch single user
.put(checkAuth, upload.single("profile_image"), editUser) // Edit user
.delete(checkAuth, deleteUser); // Delete user

// Change password
userRouter.route("/changePassword").patch(checkAuth, changePassword);

// Forgot password
userRouter.route("/forgotPassword").post(forgotPassword);

// Verify code
userRouter.route("/security/verifyCode")
.get(validateStepOne, verificationCodePage)
.post(validateStepOne, validateVerificationCode);

// Reset password
userRouter.route("/security/resetPassword")
.get(validateStepTwo, resetPasswordPage)
.post(validateStepTwo, resetPassword);

module.exports = userRouter;