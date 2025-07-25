import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  PieChart,
  Settings,
  Calendar,
  Briefcase,
  TrendingUp,
  Shield,
  UserPlus,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'verifier'] },
    { name: 'Borrowers', href: '/borrowers', icon: Users, roles: ['admin', 'verifier'] },
    { name: 'Loans', href: '/loans', icon: FileText, roles: ['admin', 'verifier'] },
    { name: 'Repayments', href: '/repayments', icon: DollarSign, roles: ['admin', 'verifier'] },
    { name: 'Loan Parameters', href: '/loan-parameters', icon: Settings, roles: ['admin'] },
    { name: 'Accounting', href: '/accounting', icon: PieChart, roles: ['admin'] },
    { name: 'Reports', href: '/reports', icon: TrendingUp, roles: ['admin'] },
    { name: 'Collateral', href: '/collateral', icon: Shield, roles: ['admin', 'verifier'] },
    { name: 'Access Configuration', href: '/access-config', icon: UserPlus, roles: ['admin'] },
    { name: 'Savings', href: '/savings', icon: Briefcase, roles: ['admin'] },
    { name: 'Other Incomes', href: '/other-incomes', icon: Calendar, roles: ['admin'] },
    { name: 'Payroll', href: '/payroll', icon: Users, roles: ['admin'] },
    { name: 'Expenses', href: '/expenses', icon: DollarSign, roles: ['admin'] },
    { name: 'E-signature', href: '/e-signature', icon: FileText, roles: ['admin'] },
    { name: 'Investor Accounts', href: '/investor-accounts', icon: TrendingUp, roles: ['admin'] },
    { name: 'Calendar', href: '/calendar', icon: Calendar, roles: ['admin', 'verifier'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'verifier'] }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex flex-col h-full bg-green-800 text-white">
      {/* Logo and User Info */}
      <div className="p-4 border-b border-green-700">
        <h1 className="text-xl font-bold text-white mb-2">CREDIT APP</h1>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-green-800 font-semibold text-sm">
              {user?.username?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-green-300 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isCurrentPage = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                isCurrentPage
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isCurrentPage ? 'text-white' : 'text-green-300 group-hover:text-white'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-green-700">
        <button
          onClick={logout}
          className="group flex items-center w-full px-2 py-2 text-sm font-medium text-green-100 rounded-md hover:bg-green-700 hover:text-white transition-colors duration-150"
        >
          <LogOut className="mr-3 h-5 w-5 text-green-300 group-hover:text-white" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
