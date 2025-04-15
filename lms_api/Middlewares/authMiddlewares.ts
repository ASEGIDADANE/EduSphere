// import { Request,Response,NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { config } from "../Config/config";
// import Blacklist from "../Models/blacklistModel";

// interface AuthenticateUser extends Request {
//     user?: {
//     id: string;
//     role: string}
// }
// export const authenticateUser = (req:AuthenticateUser, res: Response, next: NextFunction) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//         return res.status(401).json({ message: "Unauthorized" });
//     }

//     if(Blacklist){
//         return res.status(403).json({ message: "Token Blacklisted" });
//     }
//     try {
//         const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };
//         req.user = { id: decoded.id, role: decoded.role };
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: "Invalid token" });
//     }
// }



import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import Blacklist from '../Models/blacklistModel';

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: DecodedToken;
  }
}

const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];

    try {
      // ❗️ Check if token is blacklisted
      const isBlacklisted = await Blacklist.findOne({ token });

      if (isBlacklisted) {
        res.status(403).json({ message: 'Token Blacklisted' });
        return;
      }

      // ✅ Verify token
      jwt.verify(token, process.env.jwtSecret as string, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = decoded as DecodedToken;
        next();
      });

    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }

  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};

export default authenticateUser;
