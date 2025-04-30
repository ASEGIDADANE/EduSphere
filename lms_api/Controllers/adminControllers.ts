import User from "../Models/userModel";
import { Request, Response } from "express";
import { userValidationSchema, userLoginSchemaZod } from "../Models/userModel";
import mongoose from "mongoose";
import { IUser } from "../Models/userModel";
import AdminLog from "../Models/adminlogModel"; 
import { sendInstructorApprovalEmail } from "../utils/email";// Assuming you have an AdminLog model for logging admin actions




export const getallUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // --- Filtering ---
        const { email, name, role } = req.query;
        const filter: any = {};  

        if (email && typeof email === 'string') {
            // Case-insensitive email search
            filter.email = { $regex: new RegExp(email, 'i') };
        }
        if (name && typeof name === 'string') {
            // Case-insensitive partial name search
            filter.name = { $regex: new RegExp(name, 'i') };
        }
        if (role && typeof role === 'string') {
            // Exact role match 
            filter.role = role;
        }

        // --- Pagination ---
        const page = parseInt(req.query.page as string) || 1; // Default to page 1
        const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
        const skip = (page - 1) * limit;

        // --- Query Execution ---
        // Get total count for pagination metadata (matching the filter)
        const totalUsers = await User.countDocuments(filter);

        // Get paginated users matching the filter, excluding password
        const users = await User.find(filter)
            .select('-password') // Exclude password
            .sort({ createdAt: -1 }) // Optional: sort by creation date descending
            .skip(skip)
            .limit(limit);

        // --- Response ---
        res.status(200).json({
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            users,
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const changeUserRole = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; 
    const { role } = req.body;

    // Define allowed roles
    const allowedRoles: string[] = ['student', 'instructor', 'admin'];

    try {
        // 1. Validate userId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Valid User ID parameter is required.' });
            return;
        }

        // 2. Validate newRole
        if (!role || !allowedRoles.includes(role)) {
            res.status(400).json({ message: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}` });
            return;
        }

        // 3. Find user and update role
        
        const user = await User.findByIdAndUpdate(
            id,
            { role: role },
            { new: true, runValidators: true } 
        ).select('-password'); 

        // 4. Check if user was found
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // 5. Log the admin action 
        if (req.user?._id) {
            await AdminLog.create({
                adminId: req.user._id, 
                action: `Changed role of user ${user.email || id} to ${role}`,
                targetUserId: user._id, 
            });
        } else {
            // Handle case where admin user info is not available 
            console.warn('Admin user ID not found in request for logging role change.');
        }

        // 6. Send success response
        res.status(200).json({ message: 'User role updated successfully', user });

    } catch (error) {
        console.error('Error changing user role:', error);
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ message: 'Validation failed.', errors: error.errors });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; 

    try {
        // 1. Validate userId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Valid User ID parameter is required.' });
            return;
        }

        // 2. Find and delete user
        const user = await User.findByIdAndDelete(id).select('-password'); // Exclude password from the returned user object

        // 3. Check if user was found
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // 4. Log the admin action 
        if (req.user?._id) {
            await AdminLog.create({
                adminId: req.user._id, 
                action: `Deleted user ${user.email || id}`,
                targetUserId: user._id, 
            });
        } else {
            console.warn('Admin user ID not found in request for logging deletion.');
        }

        // 5. Send success response
        res.status(200).json({ message: 'User deleted successfully', user });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getPendingInstructorRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        // Find users who have requested instructor access and are pending
        const pendingRequests = await User.find({
            isInstructorRequest: true,
            instructorStatus: "pending",
        }).select("name email createdAt isInstructorRequest instructorStatus"); // Select relevant fields

        res.status(200).json({ requests: pendingRequests });

    } catch (error) {
        console.error("Error fetching pending instructor requests:", error);
        res.status(500).json({ message: "Server error" }); // Avoid sending raw error object
    }
};


export const approveInstructorRequest = async (req:Request, res: Response): Promise<void> => {
    const { id } = req.params; 

    try {
        // 1. Validate ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Valid User ID parameter is required.' });
            return;
        }

        // 2. Find the user with the pending request
        const user = await User.findById(id);

        // 3. Check if a valid pending request exists
        if (!user || user.role !== "student" || user.instructorStatus !== "pending" || !user.isInstructorRequest) {
            res.status(404).json({ message: "Valid pending instructor request not found for this user." });
            return;
        }

        // 4. Update user's role and status
        user.role = "instructor";
        user.instructorStatus = "approved";
        user.isInstructorRequest = false; // Reset the request flag

        // 5. Save the changes
        await user.save();

        // 6. Log the admin action
        if (req.user?._id) {
            await AdminLog.create({
                adminId: req.user._id,
                action: `Approved instructor request for user ${user.email || id}`,
                targetUserId: user._id,
            });
        } else {
            console.warn('Admin user ID not found in request for logging approval.');
        }

        // 7. Send success response
        res.status(200).json({ message: "Instructor request approved successfully.", user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
         sendInstructorApprovalEmail(user.email, user.name, user.instructorStatus); // Send email notification
        return; // Explicitly return void

    } catch (error) {
        console.error("Error approving instructor request:", error);
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ message: 'Validation failed during update.', errors: error.errors });
            return;
        }
        res.status(500).json({ message: "Internal server error" }); // Avoid sending raw error
    }
};

export const rejectInstructorRequest = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; 

    try {
        // 1. Validate ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Valid User ID parameter is required.' });
            return;
        }

        // 2. Find the user with the pending request
        const user = await User.findById(id);

        // 3. Check if a valid pending request exists

        if (!user || user.role !== "student" || user.instructorStatus !== "pending" || !user.isInstructorRequest) {
            res.status(404).json({ message: "Valid pending instructor request not found for this user." });
            return;
        }

        // 4. Update user's status to rejected
        user.instructorStatus = "rejected";
        user.isInstructorRequest = false; // Reset the request flag

        // 5. Save the changes
        await user.save();

        // 6. Log the admin action
        if (req.user?._id) {
            await AdminLog.create({
                adminId: req.user._id,
                action: `Rejected instructor request for user ${user.email || id}`,
                targetUserId: user._id,
            });
        } else {
            console.warn('Admin user ID not found in request for logging rejection.');
        }

        // 7. Send success response
        res.status(200).json({ message: "Instructor request rejected successfully.", user: { _id: user._id, name: user.name, email: user.email, instructorStatus: user.instructorStatus } }); 
        sendInstructorApprovalEmail(user.email, user.name, user.instructorStatus);
        return; // Send email notification

    } catch (error) {
        console.error("Error rejecting instructor request:", error);
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ message: 'Validation failed during update.', errors: error.errors });
            return;
        }
        res.status(500).json({ message: "Internal server error" }); // Avoid sending raw error
    }
};
