import express from 'express';
import {
  createLoanApplication,
  getLoanApplications,
  getLoanApplicationById,
  verifyLoanApplication,
  approveLoanApplication,
  getDashboardStats
} from '../controllers/loanController';
import { authenticateToken, requireVerifier, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public route for loan application submission
router.post('/apply', createLoanApplication);

// Protected routes
router.get('/dashboard/stats', authenticateToken, getDashboardStats);
router.get('/', authenticateToken, getLoanApplications);
router.get('/:id', authenticateToken, getLoanApplicationById);

// Verifier routes
router.put('/:id/verify', authenticateToken, requireVerifier, verifyLoanApplication);

// Admin routes
router.put('/:id/approve', authenticateToken, requireAdmin, approveLoanApplication);

export default router;
