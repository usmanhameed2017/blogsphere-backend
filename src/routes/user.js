const passport = require("passport");
const { signup, login, logout, fetchAllUsers, fetchSingleUser,
editUser, deleteUser, changePassword, forgotPassword,
resetPassword, verifyAccessToken, 
verifyResetLink,
googleLogin} = require("../controllers/user");

const { checkAuth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");
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

// Check reset password link
userRouter.route("/security/verifyResetLink/:code").get(verifyResetLink);

// Reset password
userRouter.route("/security/resetPassword").patch(resetPassword);

// Login as google
userRouter.route('/auth/google').get(passport.authenticate('google', { scope:['profile', 'email'], prompt:"select_account" }));
userRouter.route('/auth/google/callback').get(passport.authenticate('google', { session: false }), googleLogin);

module.exports = userRouter;