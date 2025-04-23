// controllers/reviewController.ts

import { Request, Response } from "express";
import courseModel from "../Models/courseModel"; // Adjust the import path as necessary
import reviewModel from "../Models/reviewModel"; // Adjust the import path as necessary
import mongoose from "mongoose"; // Import mongoose
import { recalculateAverageRating } from "../utils/recalculateRating"; // Adjust the import path as necessary


export const createOrUpdateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    const studentId = req.user._id;
    console.log("Student ID:", studentId); // Debugging line to check student ID
// Assuming you're using auth middleware and adding `req.user`

    // 1. Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // 2. Check if student is enrolled
    // const isEnrolled = course.studentEnrolled.includes(new mongoose.Types.ObjectId(studentId));
    // if (!isEnrolled) {
    //   res.status(403).json({ message: "You must be enrolled to review this course" });
    //   return;
    // } 

    const isEnrolled = course.studentEnrolled.some((enrolledStudentId) => 
        enrolledStudentId.toString() === studentId.toString()
      );
      if (!isEnrolled) {
        res.status(403).json({ message: "You must be enrolled to review this course" });
        return;
      }
   
    // 3. Check if review already exists
    const existingReview = await reviewModel.findOne({
      course: courseId,
      student: studentId,
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.status = "pending"; // reset status to pending on update
      await existingReview.save();
      res.status(200).json({ message: "Review updated and sent for moderation", review: existingReview });
    } else {
      // Create new review
      const newReview = await reviewModel.create({
        course: courseId,
        student: studentId,
        rating,
        comment,
        status: "pending", // moderation default
      });
      res.status(201).json({ message: "Review submitted for moderation", review: newReview });
    }
  } catch (error) {
    console.error("Error in createOrUpdateReview:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




export const moderateReview = async (req: Request, res: Response): Promise<void> => {
  const { reviewId } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  // Validate status
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ message: "Invalid status. Status must be 'approved' or 'rejected'." });
    return;
  }

  try {
    // Find the review by ID
    const review = await reviewModel.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    // Update the review status
    review.status = status;
    await review.save();

    // Recalculate course rating if the review is approved
    if (status === "approved") {
      await recalculateAverageRating(review.course.toString());
    }

    res.status(200).json({ message: `Review ${status} successfully`, review });
  } catch (err) {
    console.error("Error moderating review:", err);
    res.status(500).json({ message: "Error moderating review" });
  }
};

