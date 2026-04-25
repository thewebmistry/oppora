import React from 'react';
import MLMDetailView from './MLMDetailView';
import CryptoDetailView from './CryptoDetailView';

const TestComponents: React.FC = () => {
  // Sample MLM company data
  const mlmCompany = {
    gstin: '27AABCU9603R1ZX',
    registrationCertificateNo: 'U74999MH2014PTC123456',
    minTRSavings: '₹50k - ₹1L',
    directorName: 'Rajesh Kumar Sharma',
    foundedYear: 2015,
    headquarters: 'Mumbai, Maharashtra',
    website: 'https://example-mlm.com',
    productCategories: ['Health & Wellness', 'Personal Care', 'Nutrition'],
    scores: {
      overallRating: 7.5,
      trustScore: 8,
      growthTrend: 6,
      riskLevel: 4
    }
  };

  // Sample Crypto company data
  const cryptoCompany = {
    tokenSymbol: 'BTC',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e0F3B5f2b9e',
    whitepaperUrl: 'https://bitcoin.org/bitcoin.pdf',
    website: 'https://bitcoin.org',
    auditStatus: true,
    auditReportUrl: 'https://audit.example.com/report.pdf',
    scores: {
      overallRating: 9.2,
      trustScore: 85,
      growthTrend: 8,
      riskLevel: 3
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Category-Specific Detail Components Test</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">MLMDetailView Component</h2>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-300">
            <MLMDetailView company={mlmCompany} />
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800">MLM Component Features:</h3>
            <ul className="list-disc pl-5 text-blue-700 mt-2 space-y-1">
              <li>Clean grid layout with GSTIN & CIN numbers</li>
              <li>Copy icons next to sensitive IDs</li>
              <li>Registered with Ministry? badge (Yes/No)</li>
              <li>Total Savings/TRS Range display</li>
              <li>Director name and product categories</li>
              <li>Additional company information</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">CryptoDetailView Component</h2>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-300">
            <CryptoDetailView company={cryptoCompany} />
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800">Crypto Component Features:</h3>
            <ul className="list-disc pl-5 text-green-700 mt-2 space-y-1">
              <li>Large audit status indicator (Green Checkmark/Red Cross)</li>
              <li>Token info table with symbol and contract address</li>
              <li>Clickable buttons for Whitepaper, Website, Explorer</li>
              <li>Security score progress bar visualization</li>
              <li>Additional blockchain information</li>
              <li>Copy functionality for contract addresses</li>
            </ul>
          </div>
        </section>

        <section className="p-6 bg-gray-100 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Implementation Notes</h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>Both components:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use Tailwind CSS for styling (consistent with the rest of the app)</li>
              <li>Accept a company object as props (type `any` as per requirements)</li>
              <li>Are responsive with grid layouts that adapt to screen size</li>
              <li>Include proper TypeScript interfaces (though props use `any` for flexibility)</li>
              <li>Use lucide-react icons for visual elements</li>
            </ul>
            <p className="mt-4"><strong>Location:</strong> <code className="bg-gray-200 px-2 py-1 rounded">src/components/company/</code></p>
            <p><strong>Exports:</strong> Available via <code className="bg-gray-200 px-2 py-1 rounded">src/components/company/index.ts</code></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TestComponents;