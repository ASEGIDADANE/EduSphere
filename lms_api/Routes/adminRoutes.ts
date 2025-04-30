import express from 'express';
import { getallUser, changeUserRole, deleteUser,approveInstructorRequest,rejectInstructorRequest } from '../Controllers/adminControllers';

import checkRole from '../Middlewares/checkRolemiddleware';
import authenticateUser from '../Middlewares/authMiddlewares';
import { getPendingInstructorRequests } from '../Controllers/adminControllers'; // Assuming you have this controller

const router = express.Router();
router.get('/users', authenticateUser, checkRole(['admin']), getallUser); 
router.put('/users/:id', authenticateUser, checkRole(['admin']), changeUserRole); 
router.delete('/users/:id', authenticateUser, checkRole(['admin']), deleteUser);
router.get('/instructor-requests',authenticateUser,getPendingInstructorRequests)
router.put('/instructor-requests/:id/approve', authenticateUser,checkRole(['admin']), approveInstructorRequest);
router.put('/instructor-requests/:id/reject', authenticateUser,checkRole(['admin']), rejectInstructorRequest);
// router.get('/instructor-requests', authenticateUser, checkRole(['admin']), getPendingInstructorRequests); // Assuming you have this controller


export default router;