const port = process.env.PORT || 8000;
const mongodbUrl = process.env.MONGODB_URL;
const mongodbName = process.env.MONGO_DB_NAME;

const cookieParserSecret = process.env.COOKIE_PARSER_SECRET;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;

module.exports = { port, mongodbUrl, mongodbName, cookieParserSecret, accessTokenSecret, accessTokenExpiry };