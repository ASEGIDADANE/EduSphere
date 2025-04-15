import { Request,Response,NextFunction } from "express";
import { IUser } from "../Models/userModel";



const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as any; // Assuming user is added to req by authentication middleware
        if (!user) {
            res.status(403).json({ message: "Forbidden" });
        }
        const userRole = user.role;
        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ message: "Forbidden" });
        }
        next();

        

    }
}
export default checkRole;
