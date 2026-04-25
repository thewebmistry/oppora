import { Request, Response, NextFunction } from 'express';
import { Company } from '../models/Company';
import AppError from '../utils/AppError';

/**
 * Submit a new company for review
 * POST /api/v1/companies
 */
export const submitNewCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyName, slug, category, description, ownerUserId } = req.body;

    // Input validation
    if (!companyName || !slug || !category) {
      throw new AppError('Company name, slug, and category are required', 400);
    }

    // Validate category
    if (!['mlm', 'crypto', 'ecommerce'].includes(category)) {
      throw new AppError('Category must be one of: mlm, crypto, ecommerce', 400);
    }

    // Check if a company with the same name and category already exists
    const existingCompany = await Company.findOne({
      companyName,
      category,
    });

    if (existingCompany) {
      throw new AppError('A company with this name and category already exists', 409);
    }

    // Check if slug is already taken
    const existingSlug = await Company.findOne({ slug });
    if (existingSlug) {
      throw new AppError('Slug is already taken', 409);
    }

    // Create new company object
    const newCompany = new Company({
      companyName,
      slug,
      category,
      description: description || '',
      status: 'pending_review',
      ownerUserId: ownerUserId || undefined,
      // Default scores
      scores: {
        overallRating: 0,
        trustScore: 0,
        growthTrend: 0,
        riskLevel: 0,
      },
      tags: [],
    });

    // Save to database
    const savedCompany = await newCompany.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Company submitted successfully and is pending review',
      data: savedCompany,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all companies with optional filtering and pagination
 * GET /api/v1/companies
 */
export const getAllCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract query parameters
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Validate pagination parameters
    if (page < 1) {
      throw new AppError('Page must be a positive integer', 400);
    }
    if (limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400);
    }

    // Build filter query
    const filter: any = {
      status: { $ne: 'flagged_scam' }, // Exclude flagged scam companies
    };

    // Add category filter if provided
    if (category && ['mlm', 'crypto', 'ecommerce'].includes(category)) {
      filter.category = category;
    }

    // Add search filter if provided
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { companyName: searchRegex },
        { description: searchRegex },
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel for better performance
    const [companies, totalItems] = await Promise.all([
      Company.find(filter)
        .select('-__v') // Exclude version key
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        companies,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single company by slug
 * GET /api/v1/companies/:slug
 */
export const getCompanyBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw new AppError('Slug parameter is required', 400);
    }

    // Find company by slug where status is either 'active' or 'pending_review'
    const company = await Company.findOne({
      slug,
      status: { $in: ['active', 'pending_review'] },
    }).select('-__v'); // Exclude version key

    if (!company) {
      throw new AppError('Company not found or not accessible', 404);
    }

    // Return company details
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a rating for a company
 * POST /api/v1/companies/:slug/rate
 */
export const submitCompanyRating = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const { trustRating, productQuality, communitySupport, feedback } = req.body;

    if (!slug) {
      throw new AppError('Slug parameter is required', 400);
    }

    // Validate required fields
    if (trustRating === undefined || productQuality === undefined || communitySupport === undefined) {
      throw new AppError('trustRating, productQuality, and communitySupport are required', 400);
    }

    // Validate rating ranges (0-5)
    if (trustRating < 0 || trustRating > 5 ||
        productQuality < 0 || productQuality > 5 ||
        communitySupport < 0 || communitySupport > 5) {
      throw new AppError('Ratings must be between 0 and 5', 400);
    }

    // Find company
    const company = await Company.findOne({
      slug,
      status: { $in: ['active', 'pending_review'] },
    });

    if (!company) {
      throw new AppError('Company not found or not accessible', 404);
    }

    // In a real implementation, you would:
    // 1. Create a new Rating document in a separate collection
    // 2. Update company's average scores
    // 3. Store the individual rating with user info (if authenticated)
    
    // For now, we'll just return a success response
    console.log(`Rating submitted for ${company.companyName}:`, {
      trustRating,
      productQuality,
      communitySupport,
      feedback,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        companySlug: slug,
        trustRating,
        productQuality,
        communitySupport,
        feedback,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};