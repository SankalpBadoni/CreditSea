import express from 'express';
import { register, login, getProfile, getAllUsers, deleteUser } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.delete('/users/:userId', authenticateToken, requireAdmin, deleteUser);

export default router;
