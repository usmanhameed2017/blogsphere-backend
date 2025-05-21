const { v2:cloudinary } = require("cloudinary");
const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = require("../constants");
const fs = require("fs");
const path = require("path");

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
};

// Get public id
const getPublicID = (url) => {
    if(!url) return null;
    const public_id = path.parse(url).name;
    return public_id;
}

// Delete profile image
const deleteImageOnCloudinary = async (public_id) => {
    if(!public_id) return null;
    try 
    {
        const response = await cloudinary.uploader.destroy(public_id);
        return response;
    } 
    catch(error) 
    {
        console.log(error.mesage);
        return null;
    }
};

module.exports = { uploadOnCloudinary, getPublicID, deleteImageOnCloudinary };