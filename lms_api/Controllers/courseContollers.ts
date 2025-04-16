import { Request,Response } from "express";
import courseModel from "../Models/courseModel";
import { courseValidationSchema } from "../Models/courseModel";
import { z } from "zod";


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




// export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Get page & limit from query params (default page=1, limit=10)
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;

//     // Calculate how many documents to skip
//     const skip = (page - 1) * limit;

//     // Fetch courses with pagination and populate fields
//     const courses = await courseModel
//       .find()
//       .skip(skip)
//       .limit(limit)
//       .populate("instructor", "name email")
//       .populate("studentEnrolled", "name email");

//     // Total count for metadata
//     const totalCourses = await courseModel.countDocuments();
//     const totalPages = Math.ceil(totalCourses / limit);

//     // Send response
//     res.status(200).json({
//       message: "All courses retrieved successfully",
//       currentPage: page,
//       totalPages,
//       totalCourses,
//       data: courses,
//     });
//   } catch (error) {
//     console.error("This error is from get all courses:", error);
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     res.status(500).json({ message: errorMessage });
//   }
// };



export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1️⃣ Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const sort = req.query.sort as string || "-createdAt"; // Default: newest first

    // 2️⃣ Calculate skip for pagination
    const skip = (page - 1) * limit;

    // 3️⃣ Build filter object
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    // 4️⃣ Fetch filtered, paginated, sorted courses
    const courses = await courseModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate("instructor", "name email")
      .populate("studentEnrolled", "name email");

    // 5️⃣ Get total count for pagination metadata
    const totalCourses = await courseModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);

    // 6️⃣ Respond with data
    res.status(200).json({
      message: "Courses retrieved successfully",
      currentPage: page,
      totalPages,
      totalCourses,
      data: courses,
    });

  } catch (error) {
    console.error("This error is from getAllCourses:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ message: errorMessage });
  }
};



export const getCourseById = async (req:Request,res:Response):Promise<void>=>{
    try {
        const {id} = req.params;
        const course = await courseModel.findById(id).populate("instructor","name email").populate("studentEnrolled","name email");
        if (!course) {
            res.status(404).json({message:"Course not found"});
            return;
        }
        res.status(200).json({message:"Course found",course});
    } catch (error) {
        console.log('this error is from get course by id', error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ message: errorMessage });
    }
}



