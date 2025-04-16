import express, { Request, Response } from 'express';
import { cerateCourse } from '../Controllers/courseContollers';
import { verifyToken } from '../Services/jwt_services';
import  checkRole  from '../Middlewares/checkRolemiddleware';
import authenticateUser from '../Middlewares/authMiddlewares'
import { getAllCourses } from '../Controllers/courseContollers';
import { get } from 'http';

const router = express.Router();
router.post('/create',authenticateUser,checkRole(['instructor']), cerateCourse);
router.get('/courses',authenticateUser,getAllCourses);

export default router;