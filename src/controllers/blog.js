const ApiResponse = require("../utils/ApiResponse");

const createBlog = async (request, response) => {
    console.log("Body", request.body);
    console.log("Files", request.files);
    console.log("CreatedBy", request.user._id);
    return response.status(200).json(new ApiResponse(200, null, "Ok"))
}

module.exports = { createBlog };