const port = process.env.PORT || 8000;
const mongodbUrl = process.env.MONGODB_URL;
const mongodbName = process.env.MONGO_DB_NAME;
const frontendURL = process.env.FRONTEND_URL;
const backendUrl = process.env.BACKEND_URL;

const cookieParserSecret = process.env.COOKIE_PARSER_SECRET;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

const gmail = process.env.GMAIL;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

module.exports = { 
    port, 
    mongodbUrl, 
    mongodbName, 
    frontendURL,
    backendUrl,
    cookieParserSecret, 
    accessTokenSecret, 
    accessTokenExpiry,
    cloudinaryCloudName,
    cloudinaryApiKey,
    cloudinaryApiSecret,
    gmail,
    gmailAppPassword,
    googleClientId,
    googleClientSecret,
    googleCallbackUrl
};