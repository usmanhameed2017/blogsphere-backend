const { likeBlog } = require("../controllers/like");
const { checkAuth } = require("../middlewares/auth");
const likeRouter = require("express").Router();

// Like on blog
likeRouter.route("/blog").post(checkAuth, likeBlog);

module.exports = likeRouter;