import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { authConfig } from "./authConfig";
import User from "../Models/userModel";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: authConfig.google.clientID,
      clientSecret: authConfig.google.clientSecret,
      callbackURL: authConfig.google.callbackURL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Check if a user with the same email already exists
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (!user) {
          // Create a new user if not found
          user = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0].value,
            role: "student",
            provider: "google", // Mark the provider as Google
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
