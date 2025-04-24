import express from 'express';
import { getLessonContent } from '../Controllers/lessonControllers';
import authenticateUser from '../Middlewares/authMiddlewares';
import checkRole from '../Middlewares/checkRolemiddleware';
import { get } from 'http';

const router = express.Router();
router.get(
  '/courses/:courseId/lessons/:lessonId',authenticateUser,getLessonContent)
router.post(
  '/courses/:courseId/lessons',authenticateUser,checkRole(['instructor']),getLessonContent
)


  export default router;
