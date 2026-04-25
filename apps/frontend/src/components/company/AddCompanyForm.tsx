'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyCategory, Company, ApiResponse } from '@/types/company';
import InputField from '@/components/ui/InputField';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/api';

interface CompanyFormData {
  companyName: string;
  slug: string;
  website: string;
  category: CompanyCategory;
  description: string;
  // MLM specific fields
  gstNumber: string;
  directorName: string;
  // Crypto specific fields
  tokenSymbol: string;
  auditReportUrl: string;
}

const initialFormData: CompanyFormData = {
  companyName: '',
  slug: '',
  website: '',
  category: 'mlm',
  description: '',
  gstNumber: '',
  directorName: '',
  tokenSymbol: '',
  auditReportUrl: '',
};

export default function AddCompanyForm() {
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (category: CompanyCategory) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await apiClient.post<ApiResponse<Company>>('/companies', formData);
      setSuccessMessage('Company submitted successfully!');
      alert('Company submitted successfully!');
      router.push('/companies');
    } catch (error: any) {
      console.error('Submission error:', error);
      const message = error.response?.data?.message || 'Failed to submit company';
      setErrorMessage(message);
      alert(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlugFromName = () => {
    const slug = formData.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    handleChange('slug', slug);
  };

  return (
    <Card padding="lg" shadow={true} border={true} className="max-w-2xl mx-auto">
      <form onSubmit={handleOnSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Add New Company
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Submit a company for review. Fill in the details based on the company type.
          </p>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300 font-medium">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Category Switcher */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Company Type
          </h3>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleCategoryChange('mlm')}
              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                formData.category === 'mlm'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${formData.category === 'mlm' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                <span className="font-medium">MLM/Direct Selling</span>
              </div>
              <p className="text-sm mt-1 opacity-80">Multi-level marketing, network marketing, direct sales</p>
            </button>
            
            <button
              type="button"
              onClick={() => handleCategoryChange('crypto')}
              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                formData.category === 'crypto'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${formData.category === 'crypto' ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                <span className="font-medium">Crypto/Web3</span>
              </div>
              <p className="text-sm mt-1 opacity-80">Cryptocurrency, blockchain, DeFi, Web3 projects</p>
            </button>
          </div>
        </div>

        {/* Common Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Company Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Company Name"
              type="text"
              value={formData.companyName}
              onChange={(value) => handleChange('companyName', value)}
              placeholder="Enter company name"
              required
            />
            
            <div className="space-y-2">
              <InputField
                label="Slug"
                type="text"
                value={formData.slug}
                onChange={(value) => handleChange('slug', value)}
                placeholder="company-slug"
                required
              />
              <button
                type="button"
                onClick={generateSlugFromName}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Generate from company name
              </button>
            </div>
          </div>

          <InputField
            label="Website"
            type="text"
            value={formData.website}
            onChange={(value) => handleChange('website', value)}
            placeholder="https://example.com"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the company, its products/services, and business model"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[120px]"
              required
            />
          </div>
        </div>

        {/* Conditional Fields */}
        {formData.category === 'mlm' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              MLM Specific Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="GST Number"
                type="text"
                value={formData.gstNumber}
                onChange={(value) => handleChange('gstNumber', value)}
                placeholder="GSTIN number (optional)"
              />
              
              <InputField
                label="Director Name"
                type="text"
                value={formData.directorName}
                onChange={(value) => handleChange('directorName', value)}
                placeholder="Name of director/CEO (optional)"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Crypto Specific Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Token Symbol"
                type="text"
                value={formData.tokenSymbol}
                onChange={(value) => handleChange('tokenSymbol', value)}
                placeholder="e.g., BTC, ETH, SOL"
              />
              
              <InputField
                label="Audit Report URL"
                type="text"
                value={formData.auditReportUrl}
                onChange={(value) => handleChange('auditReportUrl', value)}
                placeholder="https://audit.example.com/report.pdf"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setFormData(initialFormData)}
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Reset Form
            </button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </div>

        {/* Debug Info (optional) */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Form State Preview</h4>
            <button
              type="button"
              onClick={() => console.log(formData)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Log to Console
            </button>
          </div>
          <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </form>
    </Card>
  );
}