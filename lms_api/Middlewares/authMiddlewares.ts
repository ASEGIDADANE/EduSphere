import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import Blacklist from '../Models/blacklistModel';

interface DecodedToken {
  _id: string; // ✅ This is what we’ll use internally
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
      const isBlacklisted = await Blacklist.findOne({ token });

      if (isBlacklisted) {
        res.status(403).json({ message: 'Token Blacklisted' });
        return;
      }

      jwt.verify(token, process.env.jwtSecret as string, (err, decoded) => {
        if (err || !decoded) {
          return res.status(401).json({ message: 'Invalid token' });
        }

        // Normalize to have _id
        const userData = decoded as { id: string; role: string } & DecodedToken;

        req.user = {
          _id: userData.id || userData._id, // ✅ Use _id internally
          role: userData.role,
          iat: userData.iat,
          exp: userData.exp,
        };

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
