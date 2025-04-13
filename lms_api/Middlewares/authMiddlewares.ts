import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../Config/config";

interface AuthenticateUser extends Request {
    user?: {
    id: string;
    role: string}
}
export const authenticateUser = (req: AuthenticateUser, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}




