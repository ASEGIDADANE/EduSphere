import express, { Request, Response } from 'express';
import { cerateCourse, deleteCourse, updateCourse } from '../Controllers/courseContollers';
import { verifyToken } from '../Services/jwt_services';
import  checkRole  from '../Middlewares/checkRolemiddleware';
import authenticateUser from '../Middlewares/authMiddlewares'
import { getAllCourses } from '../Controllers/courseContollers';
import { get } from 'http';

const router = express.Router();
router.post('/create',authenticateUser,checkRole(['instructor']), cerateCourse);
router.get('/courses',authenticateUser,getAllCourses);
router.put('/update/:id', authenticateUser, checkRole(['instructor']), updateCourse);
router.delete('/delete/:id', authenticateUser, checkRole(['instructor']), deleteCourse);


export default router;