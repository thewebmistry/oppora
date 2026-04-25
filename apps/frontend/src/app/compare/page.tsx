'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { Company, CompanyDetailResponse } from '@/types/company';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { Trophy, AlertCircle, TrendingUp, Shield, BarChart3 } from 'lucide-react';

// Component that uses search params (wrapped in Suspense)
function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [companyA, setCompanyA] = useState<Company | null>(null);
  const [companyB, setCompanyB] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputSlug1, setInputSlug1] = useState('');
  const [inputSlug2, setInputSlug2] = useState('');

  // Fetch company data from API
  const fetchCompany = async (slug: string): Promise<Company | null> => {
    try {
      const response = await apiClient.get<CompanyDetailResponse>(`/companies/${slug}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch company');
      }
    } catch (err: any) {
      console.error(`Error fetching company ${slug}:`, err);
      throw err;
    }
  };

  // Load companies based on URL params
  useEffect(() => {
    const comp1 = searchParams.get('comp1');
    const comp2 = searchParams.get('comp2');

    if (!comp1 || !comp2) {
      // If no params, set default or leave empty
      return;
    }

    setInputSlug1(comp1);
    setInputSlug2(comp2);

    const loadCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data1, data2] = await Promise.all([
          fetchCompany(comp1),
          fetchCompany(comp2)
        ]);
        setCompanyA(data1);
        setCompanyB(data2);
      } catch (err: any) {
        setError(err.message || 'Failed to load companies. Please check the company slugs.');
        setCompanyA(null);
        setCompanyB(null);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [searchParams]);

  // Handle compare button click
  const handleCompare = () => {
    if (!inputSlug1.trim() || !inputSlug2.trim()) {
      setError('Please enter both company slugs');
      return;
    }
    setError(null);
    router.push(`/compare?comp1=${encodeURIComponent(inputSlug1)}&comp2=${encodeURIComponent(inputSlug2)}`);
  };

  // Determine winner based on overall score
  const getWinnerVerdict = () => {
    if (!companyA || !companyB) return null;
    
    const scoreA = companyA.scores.overallRating;
    const scoreB = companyB.scores.overallRating;
    
    if (scoreA > scoreB) {
      return `${companyA.companyName} has higher Overall Score (${scoreA.toFixed(1)} vs ${scoreB.toFixed(1)})`;
    } else if (scoreB > scoreA) {
      return `${companyB.companyName} has higher Overall Score (${scoreB.toFixed(1)} vs ${scoreA.toFixed(1)})`;
    } else {
      return `Both companies have equal Overall Score (${scoreA.toFixed(1)})`;
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mlm': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'crypto': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'ecommerce': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Format category name
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Render company card
  const renderCompanyCard = (company: Company | null, side: 'left' | 'right') => {
    if (!company) {
      return (
        <Card padding="lg" className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="text-lg">No company data available</p>
          <p className="text-sm mt-2">Check if the slug is correct</p>
        </Card>
      );
    }

    const scores = company.scores;
    const isLeft = side === 'left';

    return (
      <Card padding="lg" className="h-full flex flex-col" hoverEffect>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            {company.logoUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <img 
                  src={company.logoUrl} 
                  alt={company.companyName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {company.companyName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {company.companyName}
              </h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getCategoryColor(company.category)}`}>
                {formatCategory(company.category)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {scores.overallRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Overall</div>
          </div>
        </div>

        {/* Key Metrics Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Key Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="font-medium">Trust Score</span>
              </div>
              <span className={`font-bold ${scores.trustScore >= 7 ? 'text-green-600 dark:text-green-400' : scores.trustScore >= 4 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {scores.trustScore.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                <span className="font-medium">Growth Trend</span>
              </div>
              <span className={`font-bold ${scores.growthTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {scores.growthTrend > 0 ? '+' : ''}{scores.growthTrend.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-red-500" />
                <span className="font-medium">Risk Level</span>
              </div>
              <span className={`font-bold ${scores.riskLevel <= 3 ? 'text-green-600 dark:text-green-400' : scores.riskLevel <= 6 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {scores.riskLevel.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
            {company.description || 'No description available for this company.'}
          </p>
          {company.website && (
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Visit Website →
            </a>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Company Comparison
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Compare two companies side-by-side based on trust scores, growth trends, risk levels, and overall ratings.
          </p>
        </div>

        {/* Search Inputs */}
        <Card padding="lg" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Company 1 Slug
              </label>
              <InputField
                type="text"
                placeholder="e.g., vestige"
                value={inputSlug1}
                onChange={setInputSlug1}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Company 2 Slug
              </label>
              <InputField
                type="text"
                placeholder="e.g., modicare"
                value={inputSlug2}
                onChange={setInputSlug2}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {searchParams.get('comp1') && searchParams.get('comp2') ? (
                <span>Comparing: <span className="font-semibold">{searchParams.get('comp1')}</span> vs <span className="font-semibold">{searchParams.get('comp2')}</span></span>
              ) : (
                <span>Enter company slugs to compare</span>
              )}
            </div>
            <Button
              onClick={handleCompare}
              isLoading={loading}
              disabled={!inputSlug1.trim() || !inputSlug2.trim()}
              className="min-w-[140px]"
            >
              {loading ? 'Comparing...' : 'Compare Now'}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading company data...</p>
          </div>
        )}

        {/* Comparison Grid */}
        {!loading && (companyA || companyB) && (
          <>
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* VS Badge */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl">
                  <span className="text-2xl font-bold">VS</span>
                </div>
              </div>

              {/* Company A */}
              <div className="relative">
                {renderCompanyCard(companyA, 'left')}
              </div>

              {/* Company B */}
              <div className="relative">
                {renderCompanyCard(companyB, 'right')}
              </div>
            </div>

            {/* Winner Verdict */}
            {companyA && companyB && (
              <Card padding="lg" className="border-2 border-blue-200 dark:border-blue-800">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Winner Verdict</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Based on overall score comparison
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {getWinnerVerdict()}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Higher score indicates better overall performance
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !companyA && !companyB && !error && (
          <Card padding="lg" className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <BarChart3 className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No Companies to Compare
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Enter two company slugs above to start comparing their metrics side-by-side.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Try comparing: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">vestige</span> vs <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">modicare</span></p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}