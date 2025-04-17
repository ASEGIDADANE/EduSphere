import { Request,Response } from "express";
import courseModel from "../Models/courseModel";
import { courseValidationSchema } from "../Models/courseModel";
import { z } from "zod";


import mongoose from "mongoose";

export const cerateCourse = async (req:Request,res:Response):Promise<void>=>{
    try {
        const {title,description,category,instructor,price} = req.body;
        const userId = req.user?.id; // Assuming auth middleware adds this
        // Validate user input
        const parsedData = courseValidationSchema.parse({
            title,
            description,
            category,
            instructor:userId,
            price,
        });
        const newCourse = new courseModel({
            title:parsedData.title,
            description:parsedData.description,
            category:parsedData.category,
            instructor:userId, // Use the authenticated user's ID as the instructor
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
    const filter: any = {deleted: false};
    
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
        const course = await courseModel.findById({_id:id,deleted:false}).populate("instructor","name email").populate("studentEnrolled","name email");
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



export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const userId = req.user?.id;
     // Assuming auth middleware adds this

    // Find the course by ID
    const course = await courseModel.findById(courseId);
    if (!course || course.deleted) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    console.log(course.instructor.toString(), userId) // Debugging line to check instructor ID
    // Check if the instructor owns the course
    if (course.instructor.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // Update allowed fields
    const { title, description, category, price } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (price !== undefined) course.price = price;

    // Save the updated course
    await course.save();

    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id; 
    const userId = req.user?.id; 

    // Validate course existence
    const course = await courseModel.findById(courseId);
    if (!course || course.deleted) {
      res.status(404).json({ message: "Course not found or already deleted" });
      return;
    }

    // Check if the authenticated user is the instructor of the course
    if (course.instructor.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized: You are not the instructor of this course" });
      return;
    }


    // Perform a soft delete by marking the course as deleted
    course.deleted = true;
    await course.save();

    res.status(200).json({ message: "Course deleted successfully (soft delete)" });
  } catch (error) {
    console.error("Error deleting course:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ message: errorMessage });
  }
};

