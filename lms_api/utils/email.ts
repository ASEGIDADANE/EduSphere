import nodemailer from 'nodemailer';

export const sendEnrollmentEmail = async (
  toEmail: string,
  studentName: string,
  courseTitle: string
) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: '"My Course Platform" <no-reply@courses.com>',
    to: toEmail,
    subject: 'Course Enrollment Confirmation',
    text: `Hi ${studentName},\n\nYou've successfully enrolled in ${courseTitle}. Enjoy learning!`,
  };

  await transporter.sendMail(mailOptions);
};



export const sendInstructorApprovalEmail = async (
  toEmail: string,
  userName: string,
  status: 'approved' | 'rejected'
) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject =
    status === 'approved'
      ? 'Instructor Request Approved'
      : 'Instructor Request Rejected';

  const message =
    status === 'approved'
      ? `Hi ${userName},\n\nCongratulations! Your request to become an instructor has been approved. You can now create and manage courses on our platform.`
      : `Hi ${userName},\n\nWe regret to inform you that your request to become an instructor has been rejected. Feel free to reapply in the future.`;

  const mailOptions = {
    from: '"My Course Platform" <no-reply@courses.com>',
    to: toEmail,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

