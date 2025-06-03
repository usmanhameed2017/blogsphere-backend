const blogRouter = require("express").Router();
const { createBlog, fetchAllBlogs, fetchSingleBlog, editBlog, deleteBlog, fetchRecentBlogs, fetchMyBlogs } = require("../controllers/blog");
const { checkAuth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");

blogRouter.route("/")
.post(checkAuth, upload.fields([{ name:"coverImage", maxCount:1 }, { name:"images", maxCount:5 }]), createBlog) // Create blog
.get(fetchAllBlogs); // Fetch all blogs

// Recent blogs
blogRouter.route("/recentBlogs").get(fetchRecentBlogs);

// My blogs
blogRouter.route("/myBlogs").get(checkAuth, fetchMyBlogs);

blogRouter.route("/:id")
.get(checkAuth, fetchSingleBlog) // Fetch single blog
.patch(checkAuth, upload.single("coverImage"), editBlog) // Edit blog 
.delete(checkAuth, deleteBlog); // Delete blog

module.exports = blogRouter;