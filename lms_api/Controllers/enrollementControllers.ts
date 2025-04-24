import { Request, Response } from 'express';
import Enrollment from '../Models/enrollementModel';
import Course from '../Models/courseModel';
import UserModel from '../Models/userModel';
import mongoose from 'mongoose';

import { sendEnrollmentEmail } from '../utils/email';




interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

// Define the structure of `req.params`
interface ICourseParams {
  courseId: string;
}

export const enrollInCourse = async (
  req: Request<ICourseParams, {}, {}, {}> & { user?: IUser }, // Extend Request with custom types
  res: Response
): Promise<void> => {
  const { courseId } = req.params;

  // Check if user is authenticated
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized: User information is missing' });
    return;
  }

  const user = req.user;

  // Check if user is a student
  if (user.role !== 'student') {
    res.status(403).json({ message: 'Forbidden: Only students can enroll in courses' });
    return;
  }

  try {
    // 1. Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // 2. Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ course: courseId, student: user._id });
    if (alreadyEnrolled) {
      res.status(409).json({ message: 'Already enrolled in this course' });
      return;
    }

    // 3. Handle payment if the course is paid
    let paymentId: string | null = null;
    if (course.price > 0) {
      // 🔒 Real-world: Integrate Stripe/PayPal
      // Mock payment
      const paymentSuccessful = true; // Replace with real payment logic
      if (!paymentSuccessful) {
        res.status(402).json({ message: 'Payment failed' });
        return;
      }
      paymentId = 'mock-payment-id-123'; // Replace with real payment ID
    }

    // 4. Enroll the student
    const enrollment = await Enrollment.create({
      course: courseId,
      student: user._id,
      enrolledAt: new Date(),
      status: 'active',
      paymentId,
    });

    // 5. Send confirmation email
    const student = await UserModel.findById(user._id);
    if (student) {
      await sendEnrollmentEmail(student.email, student.name, course.title);
    } else {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // 6. Respond with success
    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment,

    });
    return; // Explicitly return void
    // Explicitly return void
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Failed to enroll in course' });
    return
  }
};

interface ICourseParams {
  courseId: string;
}

interface IEnrollmentResponse {
  _id: string;
  student: {
    name: string;
    email: string;
  };
  enrolledAt: Date;
}

export const getEnrolledStudents = async (
  req: Request<ICourseParams>, // Extend Request with custom params type
  res: Response
): Promise<void> => {
  const { courseId } = req.params;

  try {
    // Fetch enrollments and populate student details
    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name email')
      .sort({ enrolledAt: -1 })
      .lean<IEnrollmentResponse[]>(); // Ensure the response is strongly typed

    if (!enrollments.length) {
      res.status(404).json({ message: 'No students enrolled' });
      return; // Explicitly return void
    }

    res.status(200).json(enrollments);
    return; // Explicitly return void
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled students' });
    return; // Explicitly return void
  }
};