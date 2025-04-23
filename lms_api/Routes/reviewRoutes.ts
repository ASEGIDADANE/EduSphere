import express from 'express';
import { createOrUpdateReview } from '../Controllers/reviewControllers';
import authenticateUser from '../Middlewares/authMiddlewares';
import checkRole from '../Middlewares/checkRolemiddleware';


const router = express.Router();
router.post('/:courseId', authenticateUser, checkRole(['student']), createOrUpdateReview);

export default router;