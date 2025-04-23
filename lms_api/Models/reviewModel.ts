// models/reviewModel.ts

import mongoose, { Document, Schema } from "mongoose";
import zod from "zod";

export interface IReview extends Document {
  course: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  status: "pending" | "approved" | "rejected";
  
  
}

const reviewSchema:Schema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
