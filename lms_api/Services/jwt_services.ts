
import jwt from 'jsonwebtoken';
import { config } from '../Config/config';
import dotenv from 'dotenv';

// Log the JWT secret to check if it's defined

interface TokenPayload {
    id: string;
    role: string;
    }

export const generateToken = (user: TokenPayload): string => {
    try{
        if (!config.jwtSecret) {
            throw new Error('JWT secret is not defined');
        }

        // return jwt.sign(user, process.env.jwtSecret as string , { expiresIn: config.jwtExpiration });
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.jwtSecret as string, {
            expiresIn: "1h"
          });
          return token;
    }
    catch (error) {
        throw new Error('Error generating token');
    }
}
export const verifyToken = (token: string): TokenPayload | null => {
    try {
        if (!config.jwtSecret) {
            throw new Error('JWT secret is not defined');
        }
        const decoded = jwt.verify(token, config.jwtSecret) as unknown as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}






