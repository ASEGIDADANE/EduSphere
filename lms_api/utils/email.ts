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
  });

  const mailOptions = {
    from: '"My Course Platform" <no-reply@courses.com>',
    to: toEmail,
    subject: 'Course Enrollment Confirmation',
    text: `Hi ${studentName},\n\nYou've successfully enrolled in ${courseTitle}. Enjoy learning!`,
  };

  await transporter.sendMail(mailOptions);
};
