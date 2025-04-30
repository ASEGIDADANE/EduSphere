import express from 'express';
import { getallUser, changeUserRole, deleteUser } from '../Controllers/adminControllers';

import checkRole from '../Middlewares/checkRolemiddleware';
import authenticateUser from '../Middlewares/authMiddlewares';

const router = express.Router();
router.get('/users', authenticateUser, checkRole(['admin']), getallUser); // Get all users
router.put('/users/:id', authenticateUser, checkRole(['admin']), changeUserRole); 
router.delete('/users/:id', authenticateUser, checkRole(['admin']), deleteUser); // Delete a user

export default router;