

import { Request, Response } from 'express';
import Enrollment from '../Models/enrollementModel'; 
import Course from '../Models/courseModel';      
import UserModel from '../Models/userModel';       
import mongoose from 'mongoose';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { paypalClient } from '../utils/paypalClient'; 
import { sendEnrollmentEmail } from '../utils/email'; 

// --- Interfaces (Keep IUser, ICourseParams) ---
interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}
interface ICourseParams {
  courseId: string;
}

/**
 * @description Initiates enrollment: Creates PayPal order for paid courses, enrolls directly for free courses.
 * @route POST /api/enrollments/:courseId/create-order  (Example Route)
 * @access Private (Student)
 */
export const createEnrollmentOrder = async (
  req: Request<ICourseParams, {}, {}, {}> & { user?: IUser },
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const user = req.user;

  // 1. --- Initial Checks ---
  if (!user) {
    res.status(401).json({ message: 'Unauthorized: User information is missing' });
    return;
  }
  if (user.role !== 'student') {
    res.status(403).json({ message: 'Forbidden: Only students can enroll' });
    return;
  }
   if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
     res.status(400).json({ message: "Valid Course ID parameter is required." });
     return;
   }

  try {
    // 2. --- Fetch Course and Check Enrollment Status ---
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    const alreadyEnrolled = await Enrollment.findOne({ course: courseId, student: user._id });
    if (alreadyEnrolled) {
      res.status(409).json({ message: 'Already enrolled in this course' });
      return;
    }

    // 3. --- Handle Paid Course: Create PayPal Order ---
    if (course.price > 0) {
      try {
        const orderRequest = new checkoutNodeJssdk.orders.OrdersCreateRequest();
        orderRequest.prefer("return=representation");
        orderRequest.requestBody({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD", 
                value: course.price.toFixed(2),
              },
              description: `Enrollment: ${course.title}`, // Optional: Add description
              // Optional: Add reference_id or custom_id if needed for reconciliation
              // custom_id: `ENROLL_${courseId}_${user._id}`
            },
          ],
          // Optional: Add application context if needed (e.g., branding)
          // application_context: { brand_name: 'Your LMS Name' }
        });

        // Execute PayPal Order Creation
        const order = await paypalClient().execute(orderRequest);
        const orderId = order.result.id;
        console.log(`PayPal Order Created ID: ${orderId} for course ${courseId}`);

        // Send ONLY the orderId back to the client
        res.status(200).json({
          message: "Order created. Proceed with payment approval.",
          paypalOrderId: orderId // Frontend needs this ID
        });
        return; 

      } catch (paymentError: any) {
        console.error('PayPal Order Creation failed:', paymentError);
        let errorMessage = "Failed to initiate payment process.";
        if (paymentError.statusCode && paymentError.message) {
            // Log the detailed PayPal error message from the response
            console.error("PayPal Error Details:", paymentError.message);
            errorMessage = `Failed to initiate payment. PayPal Error: ${paymentError.statusCode}`; // Provide status code
        }
        res.status(500).json({ message: errorMessage });
        return;
      }
    }

    // 4. --- Handle Free Course: Enroll Directly ---
    else {
      console.log(`Enrolling student ${user._id} in free course ${courseId}`);
      const enrollment = await Enrollment.create({
        course: courseId,
        student: user._id,
        enrolledAt: new Date(),
        status: 'active',
        paymentId: null, // Explicitly null for free courses
      });
      res.status(201).json({
        message: 'Enrolled successfully (Free Course)',
        enrollment,
      });

      // Send confirmation email for free course
      const student = await UserModel.findById(user._id).select('name email'); 
      if (student) {
        await sendEnrollmentEmail(student.email, student.name, course.title);
      } else {
        console.warn(`Student data not found for ID: ${user._id} after free enrollment.`);
        // Don't fail the request, enrollment succeeded, but log the issue
      }

      res.status(201).json({
        message: 'Enrolled successfully (Free Course)',
        enrollment,
      });
      return;
    }

  } catch (error: any) { 
    console.error('Enrollment initiation error:', error);
    res.status(500).json({ message: 'Failed to process enrollment request' });
    return;
  }
};



interface ICaptureBody {
  paypalOrderId: string; 
}

// --- Define IEnrollmentResponse interface ---
interface IEnrollmentResponse {
  _id: string;
  student: {
    name: string;
    email: string;
  };
  enrolledAt: Date;
}

/**
 * @description Captures an approved PayPal order and finalizes course enrollment.
 * @route POST /api/enrollments/:courseId/capture-order (Example Route)
 * @access Private (Student)
 */
export const captureOrderAndEnroll = async (
  req: Request<ICourseParams, {}, ICaptureBody> & { user?: IUser }, 
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const { paypalOrderId } = req.body; 
  const user = req.user;

  // 1. --- Basic Checks ---
  if (!user) { /* ... 401 response ... */ return; }
  if (!paypalOrderId) {
    res.status(400).json({ message: "PayPal Order ID is required in request body." });
    return;
  }
   if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
     res.status(400).json({ message: "Valid Course ID parameter is required." });
     return;
   }

  try {
    // 2. --- Verify Course and User Status (Optional but Recommended) ---
    const course = await Course.findById(courseId);
    if (!course) { /* ... 404 response ... */ return; }
    if (course.price <= 0) {
        res.status(400).json({ message: "Payment capture is only for paid courses." });
        return;
    }
     const alreadyEnrolled = await Enrollment.findOne({ course: courseId, student: user._id });
     if (alreadyEnrolled) { /* ... 409 response ... */ return; }

    // 3. --- Capture PayPal Order ---
    console.log(`Attempting to capture PayPal order: ${paypalOrderId} for course ${courseId}`);
    const captureRequest = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalOrderId);
    // IMPORTANT: The request body for capture is typically empty after client-side approval
    // captureRequest.requestBody({});

    const capture = await paypalClient().execute(captureRequest);

    // 4. --- Verify Capture Success ---
    
    if (capture.result.status !== 'COMPLETED') {
      console.error('PayPal capture status not COMPLETED:', capture.result);
      
      res.status(402).json({ message: `Payment capture failed or is pending. Status: ${capture.result.status}` });
      return;
    }

    // Extract the actual payment/capture ID from the response structure
    // Navigate carefully as the structure might vary slightly.
    const captureId = capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    if (!captureId) {
        
        console.error('Could not extract capture ID from PayPal response despite COMPLETED status:', capture.result);
      
        res.status(500).json({ message: 'Payment captured but failed to record payment details. Please contact support.' });
        return;
    }
    console.log(`PayPal Payment Captured ID: ${captureId}`);

    // 5. --- Create Enrollment Record in Database ---
    console.log(`Creating enrollment for student ${user._id} in paid course ${courseId}`);
    const enrollment = await Enrollment.create({
      course: courseId,
      student: user._id,
      enrolledAt: new Date(),
      status: 'active',
      paymentId: captureId, 
    });

    // 6. --- Send Confirmation Email ---
    const student = await UserModel.findById(user._id).select('name email');
    if (student) {
      await sendEnrollmentEmail(student.email, student.name, course.title);
    } else {
      console.warn(`Student data not found for ID: ${user._id} after paid enrollment.`);
    }

    // 7. --- Respond with Success ---
    res.status(201).json({
      message: 'Payment successful and enrolled successfully',
      enrollment,
    });
    return;

  } catch (error: any) {
    console.error('Payment Capture/Enrollment error:', error);
     let errorMessage = 'Failed to capture payment or complete enrollment.';
     let statusCode = 500;

     if (error instanceof Error && error.message.includes("PayPal")) {
        
         console.error("PayPal Capture Error Details:", error.message);
         errorMessage = `Payment processing failed. PayPal Error: ${error.message}`;
        
         statusCode = 500;
     } else if (error.name === 'ValidationError') { 
         errorMessage = `Enrollment data validation failed: ${error.message}`;
         statusCode = 400;
     }

    res.status(statusCode).json({ message: errorMessage });
    return;
  }
};

export const getEnrolledStudents = async (
  req: Request<ICourseParams>, 
  res: Response
): Promise<void> => {
  const { courseId } = req.params;

  try {
    // Fetch enrollments and populate student details
    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name email')
      .sort({ enrolledAt: -1 })
      .lean<IEnrollmentResponse[]>(); 

    if (!enrollments.length) {
      res.status(404).json({ message: 'No students enrolled' });
      return; 
    }

    res.status(200).json(enrollments);
    return;
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled students' });
    return;
  }
};