import { Company } from '@/types/company';
import { Copy } from 'lucide-react';

interface MLMDetailViewProps {
  company: any; // Using any as per requirement, but we can type it better
}

const MLMDetailView: React.FC<MLMDetailViewProps> = ({ company }) => {
  // Helper function to copy text to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add toast notification here
      console.log('Copied to clipboard:', text);
    });
  };

  // Determine if registered with ministry
  const isRegisteredWithMinistry = company.registrationCertificateNo ? 'Yes' : 'No';
  
  // Format TRS range
  const trsRange = company.minTRSavings || 'Not specified';
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">MLM Company Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1: GSTIN & CIN Number */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">GSTIN Number</p>
                <p className="font-bold text-gray-800 mt-1">
                  {company.gstin || 'Not available'}
                </p>
              </div>
              {company.gstin && (
                <button
                  onClick={() => handleCopy(company.gstin)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Copy GSTIN"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">CIN Number</p>
                <p className="font-bold text-gray-800 mt-1">
                  {company.registrationCertificateNo || 'Not available'}
                </p>
              </div>
              {company.registrationCertificateNo && (
                <button
                  onClick={() => handleCopy(company.registrationCertificateNo)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Copy CIN"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Row 2: Registered With Ministry? */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Registered With Ministry?</p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isRegisteredWithMinistry === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isRegisteredWithMinistry}
            </span>
            {company.registrationCertificateNo && (
              <p className="text-xs text-gray-500 mt-2">
                Certificate No: {company.registrationCertificateNo}
              </p>
            )}
          </div>
        </div>
        
        {/* Row 3: Total Savings/TRS Range */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Total Savings / TRS Range</p>
          <p className="font-bold text-gray-800 mt-2 text-lg">
            {trsRange.startsWith('₹') ? trsRange : `₹${trsRange}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Minimum Total Revenue Savings
          </p>
        </div>
        
        {/* Row 4: Director Name */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Director Name</p>
          <p className="font-bold text-gray-800 mt-2 text-lg">
            {company.directorName || 'Not specified'}
          </p>
          {company.productCategories && company.productCategories.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-1">Product Categories</p>
              <div className="flex flex-wrap gap-2">
                {company.productCategories.map((category: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Founded Year</p>
            <p className="font-medium text-gray-800">{company.foundedYear || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Headquarters</p>
            <p className="font-medium text-gray-800">{company.headquarters || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            {company.website ? (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                Visit Website
              </a>
            ) : (
              <p className="font-medium text-gray-800">N/A</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLMDetailView;