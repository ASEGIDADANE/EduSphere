import { Request,Response } from "express";
import courseModel from "../Models/courseModel";
import { courseValidationSchema } from "../Models/courseModel";


import mongoose from "mongoose";

export const cerateCourse = async (req:Request,res:Response):Promise<void>=>{
    try {
        const {title,description,category,instructor,price} = req.body;
        // Validate user input
        const parsedData = courseValidationSchema.parse({
            title,
            description,
            category,
            instructor,
            price,
        });
        const newCourse = new courseModel({
            title:parsedData.title,
            description:parsedData.description,
            category:parsedData.category,
            instructor:new mongoose.Types.ObjectId(parsedData.instructor),
            price:parsedData.price
        });
        await newCourse.save();
        res.status(201).json({message:"Course created successfully",course:newCourse});
    } catch (error) {
        console.log('this error is from create course', error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ message: errorMessage });
    }
}


