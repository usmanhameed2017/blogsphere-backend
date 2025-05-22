const port = process.env.PORT || 8000;
const mongodbUrl = process.env.MONGODB_URL;
const mongodbName = process.env.MONGO_DB_NAME;
const frontendURL = process.env.FRONTEND_URL;

const cookieParserSecret = process.env.COOKIE_PARSER_SECRET;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

module.exports = { 
    port, 
    mongodbUrl, 
    mongodbName, 
    frontendURL,
    cookieParserSecret, 
    accessTokenSecret, 
    accessTokenExpiry,
    cloudinaryCloudName,
    cloudinaryApiKey,
    cloudinaryApiSecret
};