import { Request, Response } from "express";
import User, { IUser } from "../Models/userModel"; // Adjust path as needed
import mongoose from "mongoose";




export const requestInstructorAccess = async (req:Request, res: Response): Promise<void> => {
    try {
        // 1. Get User ID from authenticated request
        const userId = req.user?._id;
        if (!userId) {

            res.status(401).json({ message: "Authentication required." });
            return;
        }

        // 2. Find the user in the database
       
        const user = await User.findById(userId);

        // 3. Check if user exists
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        // 4. Check if the user is currently a student
        if (user.role !== "student") {
            res.status(403).json({ message: "Only students can request instructor access." });
            return;
        }

        // 5. Check if a request is already pending

        if (user.isInstructorRequest && user.instructorStatus === "pending") {
            res.status(400).json({ message: "Instructor access request is already pending." });
            return;
        }

        // 6. Update user status to reflect the request
        user.isInstructorRequest = true;
        user.instructorStatus = "pending";

        // 7. Save the updated user document
        await user.save();

        // 8. Send success response
        res.status(200).json({ message: "Instructor access requested successfully." });

    } catch (error) {
        console.error("Error requesting instructor access:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

