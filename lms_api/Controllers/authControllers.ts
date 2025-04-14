import { Request, Response } from "express";
import { userValidationSchema, userLoginSchemaZod } from "../Models/userModel";
import User from "../Models/userModel";
import bcrypt from "bcrypt";
import { generateToken } from "../Services/jwt_services";
import jwt from "jsonwebtoken";
import Blacklist from "../Models/blacklistModel";


export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;
        console.log(req.body);
        // Validate user input
        const parsedData = userValidationSchema.parse({
            name,
            email,
            password,
            role,
        });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        // Hash password
        const hashpassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: parsedData.name,
            email: parsedData.email,
            password: hashpassword,
            role: parsedData.role,
        });
        
        console.log(newUser);
        console.log('it is new user');
        await newUser.save();
        console.log('it is new user saved');
        console.log(newUser);

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.log('this error is from register user', error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ message: errorMessage });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate user input
        const parsedData = userLoginSchemaZod.parse({
            email,
            password,
        });

        // Check if user exists
        const existingUser = await User.findOne({ email: parsedData.email });
        if (!existingUser) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }

        // Check password
        if (!existingUser.password) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(parsedData.password, existingUser.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }

        // Generate token
        const token = generateToken({
            id: existingUser.id.toString(),
            role: existingUser.role,
        });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ message: errorMessage });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const decoded:any = jwt.decode(token);
        const expire = new Date(decoded.exp * 1000);

        await Blacklist.create({ token, expiresAt:expire });
        res.status(200).json({ message: "Logout successful" });
};














