const blogRouter = require("express").Router();
const { createBlog } = require("../controllers/blog");
const { checkAuth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");

blogRouter.route("/")
.post(checkAuth, upload.fields([
    { name:"coverImage", maxCount:1 }, 
    { name:"images", maxCount:5 }]), 
    createBlog);

module.exports = blogRouter;