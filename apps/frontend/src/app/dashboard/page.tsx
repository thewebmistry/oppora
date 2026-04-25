'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Eye, Mail, Building, Crown, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function OwnerDashboard() {
  const [currentPlan] = useState('Pro Plan');
  const [isBasic] = useState(false); // Simulate basic/free plan

  // Mock data for statistics
  const stats = [
    { label: 'Profile Views', value: '1,205', icon: Eye, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Lead Requests', value: '45', icon: Mail, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Active Listings', value: '3 Companies', icon: Building, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Current Plan', value: currentPlan, subtext: 'Expires in 30 days', icon: Crown, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  ];

  // Mock transactions
  const transactions = [
    { id: 1, date: '2025-04-15', description: 'Pro Plan Monthly', amount: '$49.99', status: 'completed' },
    { id: 2, date: '2025-04-10', description: 'Document Verification Fee', amount: '$9.99', status: 'completed' },
    { id: 3, date: '2025-04-05', description: 'Basic Plan Upgrade', amount: '$29.99', status: 'pending' },
    { id: 4, date: '2025-03-28', description: 'Company Listing Boost', amount: '$19.99', status: 'completed' },
    { id: 5, date: '2025-03-15', description: 'Pro Plan Monthly', amount: '$49.99', status: 'completed' },
  ];

  const quickActions = [
    { label: 'Edit Company Profile', onClick: () => alert('Edit profile clicked') },
    { label: 'Upload Document (For Verification)', onClick: () => alert('Upload document clicked') },
    { label: 'Contact Support', onClick: () => alert('Contact support clicked') },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-4 h-4 mr-1" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="w-4 h-4 mr-1" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Welcome back, Company Owner</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Here's your business overview and analytics</p>
        </div>
        {isBasic && (
          <Button variant="primary" size="lg">
            Upgrade Plan
          </Button>
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <Card key={index} padding="lg" hoverEffect>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stat.value}</p>
                {stat.subtext && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.subtext}</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transactions Table - Takes 2/3 on desktop */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscription History</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{tx.date}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">{tx.description}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white font-bold">{tx.amount}</td>
                      <td className="py-4 px-4">{getStatusBadge(tx.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-1">
          <Card padding="lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="secondary"
                  size="lg"
                  className="w-full justify-start"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Subscription Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Plan</span>
                  <span className="font-bold text-gray-900 dark:text-white">{currentPlan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Billing Cycle</span>
                  <span className="font-bold text-gray-900 dark:text-white">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Next Billing</span>
                  <span className="font-bold text-gray-900 dark:text-white">May 15, 2025</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Tabs (only visible on mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-around md:hidden">
        {quickActions.slice(0, 3).map((action, idx) => (
          <button
            key={idx}
            className="flex flex-col items-center text-sm text-gray-700 dark:text-gray-300"
            onClick={action.onClick}
          >
            <span className="text-xs">{action.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}