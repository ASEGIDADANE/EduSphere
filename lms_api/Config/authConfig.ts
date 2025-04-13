export const authConfig = {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:5000/api/auth/google/callback',
    },
    // github: {
    //   clientID: process.env.GITHUB_CLIENT_ID || '',
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    //   callbackURL: '/auth/github/callback',
    // },
  };
  