import { Request, Response } from 'express';
import Enrollment from '../Models/enrollementModel';
import Course from '../Models/courseModel';
import UserModel from '../Models/userModel';

import { sendEnrollmentEmail } from '../utils/email';




export const enrollInCourse = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: User information is missing' });
  }
  const user = req.user;
  if (user.role != "student"){
    return res.status(403).json({ message: 'Forbidden: Only students can enroll in courses' });
  } // Assume you attach student info to req.user via middleware

  try {
    // 1. Check if course exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // 2. Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ course: courseId, student: user._id });
    if (alreadyEnrolled)
      return res.status(409).json({ message: 'Already enrolled in this course' });

    // 3. Check seat availability if course has maxSeats
    // if (course.maxSeats) {
    //   const currentEnrollmentCount = await Enrollment.countDocuments({ course: courseId });
    //   if (currentEnrollmentCount >= course.maxSeats) {
    //     return res.status(400).json({ message: 'No seats available for this course' });
    //   }
    // }

    // 4. Handle payment if paid course (mock payment here)
    let paymentId = null;
    if (course.price > 0) {
      // 🔒 Real-world: Integrate Stripe/PayPal
      // Mock payment
      const paymentSuccessful = true;
      if (!paymentSuccessful) {
        return res.status(402).json({ message: 'Payment failed' });
      }
      paymentId = 'mock-payment-id-123'; // save real paymentId if using real gateway
    }

    // 5. Enroll the student
    const enrollment = await Enrollment.create({
      course: courseId,
      student: user._id,
      enrolledAt: new Date(),
      status: 'active',
      paymentId,
    });
    var studentId = user._id; // Assuming user._id is the student ID
    // 6. Send confirmation email
    const student = await UserModel.findById(studentId);
    if (student) {
      await sendEnrollmentEmail(student.email, student.name, course.title);
    } else {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 7. Respond
    return res.status(201).json({
      message: 'Enrolled successfully',
      enrollment,
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({ message: 'Failed to enroll in course' });
  }
};
