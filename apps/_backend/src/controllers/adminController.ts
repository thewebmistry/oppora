import { Request, Response, NextFunction } from 'express';
import { Company } from '../models/Company';
import AppError from '../utils/AppError';

/**
 * Approve a company (change status to active)
 * PATCH /api/v1/companies/approve
 */
export const approveCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.body;

    // Input validation
    if (!slug) {
      throw new AppError('Company slug is required', 400);
    }

    // Find company by slug
    const company = await Company.findOne({ slug });

    if (!company) {
      throw new AppError('Company not found', 404);
    }

    // Update status to active
    company.status = 'active';
    const updatedCompany = await company.save();

    res.status(200).json({
      success: true,
      message: 'Company approved and is now live',
      company: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Flag a company as suspicious (change status to flagged_scam)
 * PATCH /api/v1/companies/flag
 */
export const flagCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.body;

    // Input validation
    if (!slug) {
      throw new AppError('Company slug is required', 400);
    }

    // Find company by slug
    const company = await Company.findOne({ slug });

    if (!company) {
      throw new AppError('Company not found', 404);
    }

    // Update status to flagged_scam
    company.status = 'flagged_scam';
    const updatedCompany = await company.save();

    res.status(200).json({
      success: true,
      message: 'Company has been flagged as suspicious',
      company: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};