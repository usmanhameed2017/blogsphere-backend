const commentRouter = require("express").Router();
const { commentOnBlog } = require("../controllers/comment");
const { checkAuth } = require("../middlewares/auth");

// Comment on blog
commentRouter.route("/blog").post(checkAuth, commentOnBlog);

module.exports = commentRouter;