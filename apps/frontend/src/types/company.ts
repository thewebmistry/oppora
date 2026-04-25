export type CompanyCategory = 'mlm' | 'crypto' | 'ecommerce';
export type CompanyStatus = 'pending_review' | 'active' | 'flagged_scam' | 'under_construction';

export interface CompanyScores {
  overallRating: number;
  trustScore: number;
  growthTrend: number;
  riskLevel: number;
}

export interface Company {
  _id: string;
  companyName: string;
  slug: string;
  category: CompanyCategory;
  logoUrl?: string;
  description?: string;
  
  // Common Details
  foundedYear?: number;
  headquarters?: string;
  website?: string;
  tags: string[];
  
  // MLM / Business Specific
  minTRSavings?: string;
  registrationCertificateNo?: string;
  gstin?: string;
  directorName?: string;
  productCategories?: string[];
  
  // Crypto Specific
  tokenSymbol?: string;
  contractAddress?: string;
  whitepaperUrl?: string;
  auditStatus?: boolean;
  auditReportUrl?: string;
  
  // Scoring Engine Fields
  scores: CompanyScores;
  
  status: CompanyStatus;
  ownerUserId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CompanyDetailResponse extends ApiResponse<Company> {}

// For radar chart data
export interface RadarChartData {
  subject: string;
  score: number;
  fullMark: number;
}