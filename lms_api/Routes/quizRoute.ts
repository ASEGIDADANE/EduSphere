import express from 'express';
import { createQuiz,summitQuiz } from '../Controllers/quizControllers';
import checkRole from '../Middlewares/checkRolemiddleware';
import authenticateUser from '../Middlewares/authMiddlewares';
import e from 'express';

const router = express.Router();
router.post('/create', authenticateUser, checkRole(['instructor']), createQuiz);
router.post('/submit', authenticateUser, summitQuiz);

export default router;



