import mongoose, { Document, Schema } from 'mongoose';

export interface ILoanApplication extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  loanAmount: number;
  loanPurpose: string;
  employmentStatus: string;
  monthlyIncome: number;
  creditScore?: number;
  collateral?: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  verificationDate?: Date;
  approvalDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema: Schema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 1000,
    max: 10000000
  },
  loanPurpose: {
    type: String,
    required: true,
    enum: ['personal', 'business', 'education', 'home', 'car', 'other']
  },
  employmentStatus: {
    type: String,
    required: true,
    enum: ['employed', 'self-employed', 'unemployed', 'student', 'retired']
  },
  monthlyIncome: {
    type: Number,
    required: true,
    min: 0
  },
  creditScore: {
    type: Number,
    min: 300,
    max: 850
  },
  collateral: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'approved', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  verificationDate: {
    type: Date
  },
  approvalDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);
