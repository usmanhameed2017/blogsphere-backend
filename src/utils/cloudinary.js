const { v2:cloudinary } = require("cloudinary");
const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = require("../constants");
const fs = require("fs");

// Configuration
cloudinary.config({
    cloud_name:cloudinaryCloudName,
    api_key:cloudinaryApiKey,
    api_secret:cloudinaryApiSecret
});

// Upload
const uploadOnCloudinary = async (localFilePath) => {
    if(!localFilePath) return null;
    
    try 
    {
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type:"auto" });
        if(fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return response.url;
    } 
    catch(error) 
    {
        if(fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return null;
    }
}

module.exports = { uploadOnCloudinary };