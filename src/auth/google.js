const passport = require("passport");
const { googleClientId, googleClientSecret, googleCallbackUrl } = require("../constants");
const User = require("../models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(new GoogleStrategy({
    clientID:googleClientId,
    clientSecret:googleClientSecret,
    callbackURL:googleCallbackUrl
},
async (accessToken, refreshToken, profile, done) => {
    try 
    {
        const user = await User.findOne({ gid:profile.id });
        if(!user)
        {
            // Create user
            const createUser = await User.create({
                gid:profile?.id,
                fname: profile?.name?.givenName || '',
                lname: profile?.name?.familyName || '',
                email: profile?.emails?.[0]?.value,
                username: profile?.emails?.[0]?.value,
                profile_image: profile?.photos?.[0]?.value || "",
                password:"GoogleLogin"
            });
            return done(null, createUser);
        }

        // If user exist
        return done(null, user);
    } 
    catch(error) 
    {
        return done(error, null);
    }
}));