import { Request, Response } from "express";
import Course from "../Models/courseModel";
import Lesson from "../Models/lessonModel"; // assumed you have a lesson model
import { promises } from "dns";



export const createLesson = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params; // Get the course ID from the route
  const { title, content, videoUrl, resources } = req.body; // Get lesson details from the request body

  try {
    // 1. Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // 2. Create the lesson
    const lesson = await Lesson.create({
      title,
      content,
      videoUrl,
      resources,
      course: courseId, // Associate the lesson with the course
    });

    // 3. Respond with the created lesson
    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ message: "Failed to create lesson" });
  }
};

export const updateLesson = async (req: Request, res: Response): Promise<void> => {
    const { courseId, lessonId } = req.params; // Get course and lesson IDs from the route
    const { title, content, videoUrl, resources } = req.body; // Get updated lesson details from the request body
    
    try {
        // 1. Check if the course exists
        const course = await Course.findById(courseId);
        if (!course) {
        res.status(404).json({ message: "Course not found" });
        return;
        }
    
        // 2. Check if the lesson exists and belongs to the course
        const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
        if (!lesson) {
        res.status(404).json({ message: "Lesson not found in this course" });
        return;
        }
    
        // 3. Update the lesson details
        lesson.title = title || lesson.title;
        lesson.content = content || lesson.content;
        lesson.videoUrl = videoUrl || lesson.videoUrl;
        lesson.resources = resources || lesson.resources;
    
        await lesson.save(); // Save the updated lesson
    
        // 4. Respond with the updated lesson
        res.json({
        message: "Lesson updated successfully",
        lesson,
        });
    } catch (error) {
        console.error("Error updating lesson:", error);
        res.status(500).json({ message: "Failed to update lesson" });
    }
    }

export const getLessonContent = async (req: Request, res: Response):Promise<void>=> {
  const userId = req.user?._id; // assuming auth middleware sets req.user
  const { courseId, lessonId } = req.params;

  try {
    // 1. Find the course
    const course = await Course.findById(courseId);
    if (!course) {
    res.status(404).json({ message: "Course not found" });
    return;
    }

    // 2. Check if user is enrolled
    const isEnrolled = course.studentEnrolled.some(
      (studentId) => studentId.toString() === userId
    );

    if (!isEnrolled) {
      res
        .status(403)
        .json({ message: "Access denied. You are not enrolled in this course." });
        return;
    }

    // 3. Find the lesson and verify it's part of this course
    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) {
      res.status(404).json({ message: "Lesson not found in this course." });
      return;
    }

    // 4. Optionally log access here...

    // 5. Return lesson content
    res.json({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      resources: lesson.resources,
    });
  } catch (error) {
    console.error("Lesson access error:", error);
    res.status(500).json({ message: "Failed to fetch lesson content" });
  }
};
