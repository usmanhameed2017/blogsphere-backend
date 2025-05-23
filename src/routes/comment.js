const commentRouter = require("express").Router();
const { commentOnBlog, editComment } = require("../controllers/comment");
const { checkAuth } = require("../middlewares/auth");

// Create comment on blog
commentRouter.route("/blog").post(checkAuth, commentOnBlog); 

commentRouter.route("/blog/:id")
.patch(checkAuth, editComment) // Edit comment

module.exports = commentRouter;