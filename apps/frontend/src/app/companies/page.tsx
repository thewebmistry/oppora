'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, Globe, Users, TrendingUp, MapPin, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/ui/PageLoader';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';

// Define the Company type
interface Company {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  location: string;
  employees: string;
  founded: string;
  revenue: string;
  slug: string;
}

// Dummy data for fallback
const dummyCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Inc.',
    description: 'Leading technology solutions provider specializing in AI and cloud computing.',
    category: 'Technology',
    logo: 'https://via.placeholder.com/80',
    location: 'San Francisco, CA',
    employees: '1,000-5,000',
    founded: '2010',
    revenue: '$500M',
    slug: 'techcorp-inc',
  },
  {
    id: '2',
    name: 'GreenEnergy Solutions',
    description: 'Renewable energy company focused on solar and wind power generation.',
    category: 'Energy',
    logo: 'https://via.placeholder.com/80',
    location: 'Austin, TX',
    employees: '500-1,000',
    founded: '2015',
    revenue: '$200M',
    slug: 'greenenergy-solutions',
  },
  {
    id: '3',
    name: 'HealthPlus Medical',
    description: 'Healthcare technology innovator improving patient care through digital solutions.',
    category: 'Healthcare',
    logo: 'https://via.placeholder.com/80',
    location: 'Boston, MA',
    employees: '2,000-5,000',
    founded: '2008',
    revenue: '$800M',
    slug: 'healthplus-medical',
  },
  {
    id: '4',
    name: 'FinSecure Bank',
    description: 'Digital banking platform with advanced security and financial tools.',
    category: 'Finance',
    logo: 'https://via.placeholder.com/80',
    location: 'New York, NY',
    employees: '5,000-10,000',
    founded: '2005',
    revenue: '$1.2B',
    slug: 'finsecure-bank',
  },
  {
    id: '5',
    name: 'EcoRetail Group',
    description: 'Sustainable retail chain with eco-friendly products and packaging.',
    category: 'Retail',
    logo: 'https://via.placeholder.com/80',
    location: 'Portland, OR',
    employees: '1,000-2,000',
    founded: '2012',
    revenue: '$300M',
    slug: 'ecoretail-group',
  },
  {
    id: '6',
    name: 'AutoInnovate Motors',
    description: 'Electric vehicle manufacturer pushing the boundaries of automotive technology.',
    category: 'Automotive',
    logo: 'https://via.placeholder.com/80',
    location: 'Detroit, MI',
    employees: '10,000+',
    founded: '2018',
    revenue: '$2.5B',
    slug: 'autoinnovate-motors',
  },
];

// Fetch companies from API
const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const response = await apiClient.get('/companies');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch companies, using dummy data:', error);
    // Return dummy data as fallback
    return dummyCompanies;
  }
};

export default function CompaniesPage() {
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use dummy data if API fails
  const displayCompanies = companies || dummyCompanies;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Discover <span className="text-blue-600 dark:text-blue-400">Companies</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
              Browse our curated directory of innovative companies across various industries. 
              Find detailed insights, metrics, and opportunities.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button variant="primary" size="lg">
                <Globe className="mr-2 h-5 w-5" />
                Explore All Industries
              </Button>
              <Button variant="outline" size="lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Trending Companies
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card padding="lg" hoverEffect>
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 mr-4">
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Companies</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{(displayCompanies.length * 100).toLocaleString()}+</p>
              </div>
            </div>
          </Card>
          <Card padding="lg" hoverEffect>
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 mr-4">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Industries</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
            </div>
          </Card>
          <Card padding="lg" hoverEffect>
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 mr-4">
                <MapPin className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Countries</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">48</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <PageLoader message="Loading companies..." size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card padding="lg" className="mb-8 border-red-200 dark:border-red-800">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <Building2 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Unable to Load Companies
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We're showing dummy data for demonstration. Please check your connection.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Companies Grid */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Featured Companies
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {displayCompanies.length} of {displayCompanies.length * 100} companies
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card padding="lg" hoverEffect border className="h-full">
                    <div className="flex flex-col h-full">
                      {/* Company Header */}
                      <div className="flex items-start mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mr-4">
                          <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {company.name}
                            </h3>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {company.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {company.description}
                          </p>
                        </div>
                      </div>

                      {/* Company Details */}
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-2" />
                          {company.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-2" />
                          {company.employees} employees
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          Founded {company.founded}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => window.location.href = `/companies/${company.slug}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Companies
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}