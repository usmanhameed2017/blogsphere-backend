const { verifySecurityToken } = require("../utils/securityTokens");

// Step 01
const validateStepOne = (request, response, next) => {
    const token = request.signedCookies?.stepOne;
    if(!token) return response.status(308).redirect(`${frontendURL}/`);

    const _id = verifySecurityToken(token);
    if(!_id) return response.status(308).redirect(`${frontendURL}/`);
    return next();
};

// Step 02
const validateStepTwo = (request, response, next) => {
    const token = request.signedCookies?.stepTwo;
    if(!token) return response.status(308).redirect(`${frontendURL}/`);

    const _id = verifySecurityToken(token);
    if(!_id) return response.status(308).redirect(`${frontendURL}/`);
    return next();
};

module.exports = { validateStepOne, validateStepTwo };