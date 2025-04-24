import  express, { RequestHandler } from 'express';
import { enrollInCourse, getEnrolledStudents } from '../Controllers/enrollementControllers';
import authenticateUser from '../Middlewares/authMiddlewares';
import checkRole from '../Middlewares/checkRolemiddleware';


const router = express.Router();
router.post('/enroll/:courseId', authenticateUser, enrollInCourse as RequestHandler<{ courseId: string }> );
router.get('/getenroll/:courseId', authenticateUser,checkRole(['admin']), getEnrolledStudents as RequestHandler<{ courseId: string }> );

export default router;