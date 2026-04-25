import { Company } from '@/types/company';
import { CheckCircle, XCircle, ExternalLink, FileText, Globe, Search } from 'lucide-react';

interface CryptoDetailViewProps {
  company: any; // Using any as per requirement
}

const CryptoDetailView: React.FC<CryptoDetailViewProps> = ({ company }) => {
  // Calculate security score (placeholder - could be derived from trustScore)
  const securityScore = company.scores?.trustScore || 75;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Cryptocurrency Project Details</h3>
      
      {/* Audit Status */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Audit Status</h4>
            <p className="text-sm text-gray-500 mt-1">Independent security audit verification</p>
          </div>
          <div className="flex items-center">
            {company.auditStatus ? (
              <>
                <CheckCircle className="h-10 w-10 text-green-500" />
                <div className="ml-3">
                  <p className="font-bold text-green-700">Audit Passed</p>
                  <p className="text-sm text-green-600">Verified by security auditors</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-10 w-10 text-red-500" />
                <div className="ml-3">
                  <p className="font-bold text-red-700">Not Audited</p>
                  <p className="text-sm text-red-600">No security audit available</p>
                </div>
              </>
            )}
          </div>
          {company.auditReportUrl && (
            <a
              href={company.auditReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText size={16} className="mr-2" />
              View Audit Report
            </a>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Info Table */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Token Information</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Symbol</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-bold">
                    {company.tokenSymbol || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {company.tokenSymbol && (
                      <button
                        onClick={() => navigator.clipboard.writeText(company.tokenSymbol)}
                        className="text-gray-500 hover:text-blue-600 p-1 rounded"
                        title="Copy symbol"
                      >
                        Copy
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Contract Address</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800 font-mono truncate max-w-xs">
                      {company.contractAddress || 'Not available'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {company.contractAddress && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(company.contractAddress)}
                          className="text-gray-500 hover:text-blue-600 p-1 rounded"
                          title="Copy address"
                        >
                          Copy
                        </button>
                        <a
                          href={`https://etherscan.io/address/${company.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-blue-600 p-1 rounded"
                          title="View on explorer"
                        >
                          <Search size={16} />
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Additional token info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Note:</span> Always verify contract addresses from official sources before transactions.
            </p>
          </div>
        </div>
        
        {/* Security Score Progress Bar */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Security Score</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Trust & Security Rating</span>
                <span className="text-sm font-bold text-gray-900">{securityScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${securityScore >= 70 ? 'bg-green-500' : securityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${securityScore}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500">Overall Rating</p>
                <p className="text-2xl font-bold text-gray-800">{company.scores?.overallRating || 'N/A'}/10</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-500">Risk Level</p>
                <p className="text-2xl font-bold text-gray-800">{company.scores?.riskLevel || 'N/A'}/10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Links Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Project Links</h4>
        <div className="flex flex-wrap gap-4">
          {/* Whitepaper Button */}
          {company.whitepaperUrl ? (
            <a
              href={company.whitepaperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 rounded-lg transition-colors bg-purple-50 text-purple-700 hover:bg-purple-100"
            >
              <FileText size={18} className="mr-3" />
              <div className="text-left">
                <p className="font-medium">Whitepaper</p>
                <p className="text-xs">Technical documentation</p>
              </div>
              <ExternalLink size={16} className="ml-3" />
            </a>
          ) : (
            <div className="inline-flex items-center px-5 py-3 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
              <FileText size={18} className="mr-3" />
              <div className="text-left">
                <p className="font-medium">Whitepaper</p>
                <p className="text-xs">Not available</p>
              </div>
            </div>
          )}
          
          {/* Website Button */}
          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 rounded-lg transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Globe size={18} className="mr-3" />
              <div className="text-left">
                <p className="font-medium">Website</p>
                <p className="text-xs">Official project site</p>
              </div>
              <ExternalLink size={16} className="ml-3" />
            </a>
          ) : (
            <div className="inline-flex items-center px-5 py-3 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
              <Globe size={18} className="mr-3" />
              <div className="text-left">
                <p className="font-medium">Website</p>
                <p className="text-xs">Not available</p>
              </div>
            </div>
          )}
          
          {/* Explorer Button */}
          {company.contractAddress ? (
            <a
              href={`https://etherscan.io/address/${company.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 rounded-lg transition-colors bg-green-50 text-green-700 hover:bg-green-100"
            >
              <Search size={18} className="mr-3" />
              <div className="text-left">
                <p className="font-medium">Block Explorer</p>
                <p className="text-xs">View on-chain activity</p>
              </div>
              <ExternalLink size={16} className="ml-3" />
            </a>
          ) : (
            <div className="inline-flex items-center px-5 py-3 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
              <Search size={18} className="mr-3" />
              <div className="text-left">
                <p className="font-medium">Block Explorer</p>
                <p className="text-xs">Not available</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Blockchain</p>
            <p className="font-medium text-gray-800">Ethereum</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Token Standard</p>
            <p className="font-medium text-gray-800">ERC-20</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Audit Provider</p>
            <p className="font-medium text-gray-800">{company.auditStatus ? 'CertiK' : 'Not audited'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoDetailView;