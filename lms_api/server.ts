

import express from 'express';
import mongoose from 'mongoose';
import {config} from './Config/config';
import connectDB from './Config/db';
import authRoutes from './Routes/authRoutes';
import session from 'express-session';
import passport from 'passport';
import './Config/passport';
import { authConfig } from './Config/authConfig';
import cookieparser from 'cookie-parser';

const app = express();
app.use(cookieparser());

// connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/api/auth', authRoutes);

app.listen(config.PORT, () => { 
    console.log(`Server is running on port ${config.PORT}`);
    }
);