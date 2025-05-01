import  express, { RequestHandler } from 'express';
import {captureOrderAndEnroll ,createEnrollmentOrder, getEnrolledStudents } from '../Controllers/enrollementControllers';
import authenticateUser from '../Middlewares/authMiddlewares';
import checkRole from '../Middlewares/checkRolemiddleware';


const router = express.Router();
router.post('/enroll/:courseId/capture-order', authenticateUser, captureOrderAndEnroll as RequestHandler<{ courseId: string }> );
router.get('/getenroll/:courseId', authenticateUser,checkRole(['admin']), getEnrolledStudents as RequestHandler<{ courseId: string }> );
router.post('/enroll/:courseId/create-order', authenticateUser, createEnrollmentOrder as RequestHandler<{ courseId: string }> );    

export default router;