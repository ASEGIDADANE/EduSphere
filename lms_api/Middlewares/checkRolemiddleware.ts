import { Request,Response,NextFunction } from "express";
import { IUser } from "../Models/userModel";



export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as any; // Assuming user is added to req by authentication middleware
        if (!user) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const userRole = user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();



    }
}
