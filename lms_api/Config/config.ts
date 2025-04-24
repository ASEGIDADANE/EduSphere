import dotenv from 'dotenv';
dotenv.config();
export const config = {
  PORT: process.env.PORT || 3000,
  CONNECTION_STRING: process.env.CONNECTION_STRING ,
  jwtSecret:process.env.JWTSECRET||'secret' ,
  jwtExpiration:'7d',
  secret: process.env.SESSION_SECRET || 'secret',
  paypal_secrete: process.env.PAYPAL_SECRET, 
  paypal_client_id: process.env.PAYPAL_CLIENT_ID,

};




