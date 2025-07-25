import React from 'react';
import { Users, FileText, DollarSign, TrendingUp, Briefcase, Building2 } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]} text-white mr-4`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );
};

const DashboardStats = ({ stats, userRole }) => {
  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  if (userRole === 'admin') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="ACTIVE USERS"
          value={formatNumber(stats?.activeUsers)}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="BORROWERS"
          value={formatNumber(stats?.borrowers)}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="CASH DISBURSED"
          value={formatCurrency(stats?.cashDisbursed)}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="CASH RECEIVED"
          value={formatCurrency(stats?.cashReceived)}
          icon={TrendingUp}
          color="green"
        />
        
        <StatsCard
          title="SAVINGS"
          value={formatCurrency(stats?.savings)}
          icon={Briefcase}
          color="green"
        />
        <StatsCard
          title="REPAID LOANS"
          value={formatNumber(stats?.repaidLoans)}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="OTHER ACCOUNTS"
          value={formatNumber(stats?.otherAccounts)}
          icon={Building2}
          color="green"
        />
        <StatsCard
          title="LOANS"
          value={formatNumber(stats?.totalLoans)}
          icon={FileText}
          color="green"
        />
      </div>
    );
  }

  // Verifier view - simplified stats
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="LOANS"
        value={formatNumber(stats?.totalLoans)}
        icon={FileText}
        color="green"
      />
      <StatsCard
        title="BORROWERS"
        value={formatNumber(stats?.borrowers)}
        icon={Users}
        color="green"
      />
      <StatsCard
        title="CASH DISBURSED"
        value={formatCurrency(stats?.cashDisbursed)}
        icon={DollarSign}
        color="green"
      />
      <StatsCard
        title="CASH RECEIVED"
        value={formatCurrency(stats?.cashReceived)}
        icon={TrendingUp}
        color="green"
      />
    </div>
  );
};

export default DashboardStats;
