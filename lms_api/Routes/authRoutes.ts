
import express, { Request, Response } from 'express';
// import { registerUser, loginUser } from '../Controllers/authControllers';
import { registerUser, loginUser,logout } from '../Controllers/authControllers';
import passport from 'passport';
import { generateToken } from '../Services/jwt_services';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser); 
router.post('/logout',logout) 

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user);
    res.json({ token, user });
  }
);
 


export default router;




