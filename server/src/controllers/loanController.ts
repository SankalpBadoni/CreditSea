import { Request, Response } from 'express';
import LoanApplication, { ILoanApplication } from '../models/LoanApplication';
import { AuthRequest } from '../middleware/auth';

export const createLoanApplication = async (req: Request, res: Response) => {
  try {
    const applicationData = req.body;

    const loanApplication = new LoanApplication(applicationData);
    await loanApplication.save();

    res.status(201).json({
      message: 'Loan application submitted successfully',
      application: loanApplication
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error creating loan application',
      error: error.message
    });
  }
};

export const getLoanApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const user = req.user;

    const filter: any = {};
    
    // If verifier, only show pending applications
    // If admin, show verified applications
    if (user?.role === 'verifier') {
      filter.status = 'pending';
    } else if (user?.role === 'admin') {
      filter.status = { $in: ['verified', 'approved', 'rejected'] };
    }

    if (status) {
      filter.status = status;
    }

    const applications = await LoanApplication.find(filter)
      .populate('verifiedBy', 'username email')
      .populate('approvedBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await LoanApplication.countDocuments(filter);

    res.json({
      applications,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching loan applications',
      error: error.message
    });
  }
};

export const getLoanApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await LoanApplication.findById(id)
      .populate('verifiedBy', 'username email')
      .populate('approvedBy', 'username email');

    if (!application) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    res.json({ application });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching loan application',
      error: error.message
    });
  }
};

export const verifyLoanApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'verify' or 'reject'
    const user = req.user;

    const application = await LoanApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application has already been processed' });
    }

    if (action === 'verify') {
      application.status = 'verified';
      application.verifiedBy = user?._id;
      application.verificationDate = new Date();
    } else if (action === 'reject') {
      application.status = 'rejected';
      application.verifiedBy = user?._id;
      application.verificationDate = new Date();
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    res.json({
      message: `Application ${action}ed successfully`,
      application
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error processing loan application',
      error: error.message
    });
  }
};

export const approveLoanApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'
    const user = req.user;

    const application = await LoanApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    if (application.status !== 'verified') {
      return res.status(400).json({ message: 'Application must be verified before approval' });
    }

    if (action === 'approve') {
      application.status = 'approved';
      application.approvedBy = user?._id;
      application.approvalDate = new Date();
    } else if (action === 'reject') {
      application.status = 'rejected';
      application.approvedBy = user?._id;
      application.approvalDate = new Date();
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    res.json({
      message: `Application ${action}ed successfully`,
      application
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error processing loan application',
      error: error.message
    });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    // Get basic stats
    const totalApplications = await LoanApplication.countDocuments();
    const pendingApplications = await LoanApplication.countDocuments({ status: 'pending' });
    const verifiedApplications = await LoanApplication.countDocuments({ status: 'verified' });
    const approvedApplications = await LoanApplication.countDocuments({ status: 'approved' });
    const rejectedApplications = await LoanApplication.countDocuments({ status: 'rejected' });

    // Calculate financial stats
    const approvedLoans = await LoanApplication.find({ status: 'approved' });
    const totalDisbursed = approvedLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);

    // Get recent applications
    const recentApplications = await LoanApplication.find()
      .populate('verifiedBy', 'username')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      totalLoans: totalApplications,
      activeUsers: 200, // This would be calculated based on your user activity logic
      borrowers: 100, // This would be unique borrowers
      cashDisbursed: totalDisbursed,
      cashReceived: Math.floor(totalDisbursed * 1.1), // Assuming 10% interest
      savings: 450000, // This would be calculated based on your business logic
      repaidLoans: 30,
      otherAccounts: 10,
      pendingApplications,
      verifiedApplications,
      approvedApplications,
      rejectedApplications,
      recentApplications
    };

    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};
