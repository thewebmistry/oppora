'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Clock, AlertCircle, CheckCircle, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/api';
import { Company, CompanyCategory } from '@/types/company';

interface ApiResponse {
  success: boolean;
  data: Company[];
  message?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<string | null>(null); // company ID that is loading

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ApiResponse>('/companies', {
        params: { status: 'pending_review' }
      });
      
      if (response.data.success) {
        setPendingCompanies(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch pending companies');
      }
    } catch (err: any) {
      console.error('Error fetching pending companies:', err);
      setError(err.response?.data?.message || err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleDescription = (companyId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  const handleApprove = async (companyId: string) => {
    const company = pendingCompanies.find(c => c._id === companyId);
    if (!company) return;
    
    if (!confirm('Are you sure you want to approve this company?')) {
      return;
    }
    setIsLoading(companyId);
    try {
      await apiClient.patch('/companies/approve', { slug: company.slug });
      setPendingCompanies(prev => prev.filter(c => c._id !== companyId));
      alert('Company Approved!');
      // Optionally redirect to companies page
      // router.push('/companies');
    } catch (err: any) {
      console.error('Error approving company:', err);
      alert(err.response?.data?.message || err.message || 'Failed to approve company');
    } finally {
      setIsLoading(null);
    }
  };

  const handleFlag = async (companyId: string) => {
    const company = pendingCompanies.find(c => c._id === companyId);
    if (!company) return;
    
    if (!confirm('Are you sure you want to flag this company as suspicious?')) {
      return;
    }
    setIsLoading(companyId);
    try {
      await apiClient.patch('/companies/flag', { slug: company.slug });
      setPendingCompanies(prev => prev.filter(c => c._id !== companyId));
      alert('Company Flagged as Scam!');
    } catch (err: any) {
      console.error('Error flagging company:', err);
      alert(err.response?.data?.message || err.message || 'Failed to flag company');
    } finally {
      setIsLoading(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `Submitted ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `Submitted ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `Submitted ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  const getCategoryBadgeColor = (category: CompanyCategory) => {
    switch (category) {
      case 'mlm':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'crypto':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ecommerce':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryDisplayName = (category: CompanyCategory) => {
    switch (category) {
      case 'mlm':
        return 'MLM';
      case 'crypto':
        return 'Crypto';
      case 'ecommerce':
        return 'E-commerce';
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pending reviews...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8">
            <div className="flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
              <AlertCircle className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-4">
              Error Loading Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{error}</p>
            <div className="flex justify-center">
              <Button variant="primary" onClick={fetchPendingCompanies}>
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Admin: Company Intelligence Review
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Review and manage companies pending approval
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {pendingCompanies.length} Pending
                </span>
              </div>
              <Button variant="outline" onClick={fetchPendingCompanies}>
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Pending</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {pendingCompanies.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">MLM Companies</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {pendingCompanies.filter(c => c.category === 'mlm').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Crypto Projects</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {pendingCompanies.filter(c => c.category === 'crypto').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Pending Reviews
          </h2>
          
          {pendingCompanies.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No Pending Reviews
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  All companies have been reviewed. Check back later for new submissions.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingCompanies.map((company) => (
                <Card 
                  key={company._id} 
                  className="p-6 hover:shadow-xl transition-all duration-300"
                  hoverEffect
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {company.companyName}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeColor(company.category)}`}>
                          {getCategoryDisplayName(company.category)}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(company.createdAt)}
                        </span>
                      </div>
                    </div>
                    {company.logoUrl && (
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={company.logoUrl} 
                          alt={company.companyName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Quick Info Section */}
                  <div className="mb-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-2"
                      onClick={() => toggleDescription(company._id)}
                    >
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                        Quick Info
                      </h4>
                      {expandedDescriptions[company._id] ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    
                    <div className={`text-gray-600 dark:text-gray-400 ${expandedDescriptions[company._id] ? '' : 'line-clamp-2'}`}>
                      {company.description || 'No description provided.'}
                    </div>
                    
                    {company.description && company.description.length > 150 && (
                      <button
                        onClick={() => toggleDescription(company._id)}
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2"
                      >
                        {expandedDescriptions[company._id] ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {company.foundedYear && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Founded</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {company.foundedYear}
                        </p>
                      </div>
                    )}
                    {company.headquarters && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Headquarters</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {company.headquarters}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleApprove(company._id)}
                      isLoading={isLoading === company._id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isLoading === company._id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => handleFlag(company._id)}
                      isLoading={isLoading === company._id}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      {isLoading === company._id ? 'Processing...' : 'Flag/Suspicious'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>
            This dashboard is for administrative review only. All actions are logged and require confirmation.
          </p>
          <p className="mt-1">
            Need help? Contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}