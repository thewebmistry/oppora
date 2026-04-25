'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Company } from '@/types/company';
import { Product } from '@/types/product';
import { Button, Card } from '@/components/ui';
import { MLMDetailView, CryptoDetailView, UserRatingForm, ProductCard } from '@/components/company';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CompanyDetailPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string>('');
  const [company, setCompany] = useState<Company | null>(null);
  const [companyProducts, setCompanyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setSlug(resolved.slug);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Fetch company and products in parallel
        const [companyRes, productsRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/companies/${slug}`),
          fetch(`${apiUrl}/api/v1/products/company/${slug}`)
        ]);

        // Handle company response
        if (!companyRes.ok) {
          if (companyRes.status === 404) {
            setError('Company not found');
            return;
          }
          throw new Error(`Failed to fetch company: ${companyRes.statusText}`);
        }

        const companyData = await companyRes.json();
        if (!companyData.success) {
          setError(companyData.message || 'Unknown error fetching company');
          return;
        }

        // Handle products response
        if (!productsRes.ok) {
          // If products endpoint fails, we still show company but with empty products
          console.warn('Failed to fetch products:', productsRes.statusText);
          setCompanyProducts([]);
        } else {
          const productsData = await productsRes.json();
          if (productsData.status === 'success') {
            setCompanyProducts(productsData.data.products || []);
          } else {
            setCompanyProducts([]);
          }
        }

        setCompany(companyData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (error) {
    if (error === 'Company not found') {
      notFound();
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">No company data</div>
      </div>
    );
  }

  // Helper to get badge color based on category
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'mlm':
        return {
          label: 'MLM Company',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        };
      case 'crypto':
        return {
          label: 'Crypto Project',
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        };
      case 'ecommerce':
        return {
          label: 'E‑Commerce',
          className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        };
      default:
        return {
          label: category,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };
    }
  };

  const badge = getCategoryBadge(company.category);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      {/* HEADER SECTION */}
      <Card padding="lg" shadow hoverEffect={false} border className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.companyName} logo`}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {company.companyName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Company Name & Badge */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {company.companyName}
              </h1>
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${badge.className} self-start md:self-auto`}
              >
                {badge.label}
              </span>
            </div>
            {company.description && (
              <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-3xl">
                {company.description}
              </p>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="primary" size="lg">
            View Ratings
          </Button>
          <Button variant="outline" size="lg">
            Share Profile
          </Button>
        </div>
      </Card>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card padding="lg" shadow hoverEffect>
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Overall Score</p>
            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              {company.scores.overallRating}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">out of 100</p>
          </div>
        </Card>
        <Card padding="lg" shadow hoverEffect>
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Trust Score</p>
            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              {company.scores.trustScore}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">out of 100</p>
          </div>
        </Card>
        <Card padding="lg" shadow hoverEffect>
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Risk Level</p>
            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              {company.scores.riskLevel}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">lower is better</p>
          </div>
        </Card>
      </div>

      {/* RADAR CHART SECTION (Placeholder for now) */}
      <Card padding="lg" shadow className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Performance Radar</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">
            Radar chart will be integrated here
          </p>
        </div>
      </Card>

      {/* CATEGORY-SPECIFIC DETAILS */}
      <div className="mt-8 space-y-6">
        {company.category === 'mlm' && (
          <Card padding="lg" shadow>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Official Registration & Details</h2>
            <MLMDetailView company={company} />
          </Card>
        )}
        {company.category === 'crypto' && (
          <Card padding="lg" shadow>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tokenomics & Audit Status</h2>
            <CryptoDetailView company={company} />
          </Card>
        )}
        {!['mlm', 'crypto'].includes(company.category) && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Category details coming soon.
          </p>
        )}
      </div>

      {/* PRODUCT PORTFOLIO / SERVICES */}
      <div className="mt-12">
        <Card padding="lg" shadow className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Portfolio / Services</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Explore products and services offered by {company.companyName}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {companyProducts.length} {companyProducts.length === 1 ? 'product' : 'products'} available
            </div>
          </div>

          {companyProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No active products listed</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                This company hasn't listed any products or services yet. Check back later for updates.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* USER RATING FORM */}
      <UserRatingForm companySlug={slug} />

      {/* DEBUG INFO (optional - can be removed later) */}
      <details className="mt-12 text-sm">
        <summary className="cursor-pointer text-gray-500 dark:text-gray-400">
          Debug details
        </summary>
        <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded text-sm overflow-auto">
          {JSON.stringify(company, null, 2)}
        </pre>
      </details>
    </div>
  );
}