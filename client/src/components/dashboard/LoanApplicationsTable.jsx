import React, { useState } from 'react';
import { Check, X, Eye, Clock, CheckCircle, XCircle, FileText, DollarSign } from 'lucide-react';
import { apiClient } from '../../utils/api';

const LoanApplicationsTable = ({ applications, onStatusUpdate, userRole }) => {
  const [loading, setLoading] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentApplicationId, setCurrentApplicationId] = useState(null);
  const [actionType, setActionType] = useState(''); // 'verify' or 'approve'

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'approved':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleAction = async (applicationId, action, rejectionReason = '') => {
    setLoading(prev => ({ ...prev, [applicationId]: true }));

    try {
      let response;
      if (userRole === 'verifier') {
        response = await apiClient.verifyLoanApplication(applicationId, action, rejectionReason);
      } else if (userRole === 'admin') {
        if (action === 'verify' || action === 'reject') {
          response = await apiClient.verifyLoanApplication(applicationId, action, rejectionReason);
        } else {
          response = await apiClient.approveLoanApplication(applicationId, action, rejectionReason);
        }
      }

      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Error updating application: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const openRejectModal = (applicationId, type) => {
    setCurrentApplicationId(applicationId);
    setActionType(type);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    await handleAction(currentApplicationId, 'reject', rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
    setCurrentApplicationId(null);
    setActionType('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Show different applications based on user role
  const getVisibleApplications = () => {
    if (userRole === 'verifier') {
      return applications.filter(app => app.status === 'pending');
    } else if (userRole === 'admin') {
      // Admin can see all applications, with priority on those needing approval
      return applications.sort((a, b) => {
        const priority = { verified: 1, pending: 2, approved: 3, rejected: 4 };
        return priority[a.status] - priority[b.status];
      });
    }
    return applications;
  };

  const visibleApplications = getVisibleApplications();

  if (!visibleApplications || visibleApplications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          {userRole === 'verifier' ? 'No pending loan applications found' : 'No loan applications found'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {userRole === 'verifier' ? 'Applied Loans' : 'Recent Loans'}
        </h3>
        <div className="flex items-center space-x-2">
          <button className="text-sm text-gray-500 hover:text-gray-700">Sort</button>
          <button className="text-sm text-gray-500 hover:text-gray-700">Filter</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleApplications.map((application) => (
              <tr key={application._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {application.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {application.email}
                      </p>
                      <p className="text-sm text-gray-500">{application.phoneNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{application.fullName}</p>
                    <p className="text-sm text-gray-500 capitalize">{application.loanPurpose}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(application.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(application.loanAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <span className="ml-1 capitalize">{application.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Verifier Actions - Only for pending applications */}
                    {userRole === 'verifier' && application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(application._id, 'verify')}
                          disabled={loading[application._id]}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                        >
                          {loading[application._id] ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Verify
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openRejectModal(application._id, 'verify')}
                          disabled={loading[application._id]}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {/* Admin Actions */}
                    {userRole === 'admin' && (
                      <>
                        {/* Admin can verify pending applications */}
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(application._id, 'verify')}
                              disabled={loading[application._id]}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                            >
                              {loading[application._id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verify
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openRejectModal(application._id, 'verify')}
                              disabled={loading[application._id]}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {/* Admin can approve verified applications */}
                        {application.status === 'verified' && (
                          <>
                            <button
                              onClick={() => handleAction(application._id, 'approve')}
                              disabled={loading[application._id]}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                            >
                              {loading[application._id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve Loan
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openRejectModal(application._id, 'approve')}
                              disabled={loading[application._id]}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* View Details Button - Available for all roles */}
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedApplication.loanAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loan Purpose</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedApplication.loanPurpose}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedApplication.employmentStatus}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedApplication.monthlyIncome)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusIcon(selectedApplication.status)}
                      <span className="ml-1 capitalize">{selectedApplication.status}</span>
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.address}</p>
                </div>

                {selectedApplication.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <p className="mt-1 text-sm text-red-600">{selectedApplication.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === 'verify' ? 'Reject Application' : 'Reject Loan'}
                </h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setCurrentApplicationId(null);
                    setActionType('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please provide a reason for rejection:
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter rejection reason..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                      setCurrentApplicationId(null);
                      setActionType('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject {actionType === 'verify' ? 'Application' : 'Loan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanApplicationsTable;
