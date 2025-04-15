import express, { Request, Response } from 'express';
import { cerateCourse } from '../Controllers/courseContollers';
import { verifyToken } from '../Services/jwt_services';
import  checkRole  from '../Middlewares/checkRolemiddleware';
import authenticateUser from '../Middlewares/authMiddlewares'

const router = express.Router();
router.post('/create',authenticateUser,checkRole(['instructor']), cerateCourse);

export default router;