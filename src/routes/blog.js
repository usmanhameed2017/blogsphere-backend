const blogRouter = require("express").Router();
const { createBlog, fetchAllBlogs, fetchSingleBlog, editBlog, deleteBlog } = require("../controllers/blog");
const { checkAuth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");

blogRouter.route("/")
.post(checkAuth, upload.fields([{ name:"coverImage", maxCount:1 }, { name:"images", maxCount:5 }]), createBlog) // Create blog
.get(fetchAllBlogs); // Fetch all blogs

blogRouter.route("/:id")
.get(checkAuth, fetchSingleBlog) // Fetch single blog
.patch(checkAuth, upload.single("coverImage"), editBlog) // Edit blog 
.delete(checkAuth, deleteBlog); // Delete blog

module.exports = blogRouter;