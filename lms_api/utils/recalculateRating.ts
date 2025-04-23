import Review from "../Models/reviewModel";
import Course from "../Models/courseModel";

export const recalculateAverageRating = async (courseId: string): Promise<void> => {
  try {
    // Find all approved reviews for the course
    const approvedReviews = await Review.find({ course: courseId, status: "approved" });

    if (approvedReviews.length === 0) {
      // If no approved reviews, set the course rating to 0
      await Course.findByIdAndUpdate(courseId, { rate: 0 });
      return;
    }

    // Calculate the average rating
    const sum = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
    const avg = parseFloat((sum / approvedReviews.length).toFixed(1)); // Round to 1 decimal place

    // Update the course's rating
    await Course.findByIdAndUpdate(courseId, { rate: avg });
  } catch (err) {
    console.error("Error recalculating average rating:", err);
    throw new Error("Failed to recalculate average rating");
  }
};
