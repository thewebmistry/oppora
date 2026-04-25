import { Router } from 'express';
import {
  submitNewCompany,
  getAllCompanies,
  getCompanyBySlug,
  submitCompanyRating,
} from '../controllers/companyController';
import {
  approveCompany,
  flagCompany,
} from '../controllers/adminController';

const router = Router();

/**
 * @route   POST /api/v1/companies
 * @desc    Submit a new company for review
 * @access  Public (for now, can be changed to private later)
 */
router.post('/', submitNewCompany);

/**
 * @route   GET /api/v1/companies
 * @desc    Get all companies with optional filtering, search, and pagination
 * @query   {string} [category] - Filter by category (mlm, crypto, ecommerce)
 * @query   {string} [search] - Search in companyName and description (case-insensitive)
 * @query   {number} [page=1] - Page number for pagination
 * @query   {number} [limit=20] - Items per page (1-100)
 * @access  Public
 */
router.get('/', getAllCompanies);

/**
 * @route   GET /api/v1/companies/:slug
 * @desc    Get a single company by slug
 * @access  Public
 */
router.get('/:slug', getCompanyBySlug);

/**
 * @route   POST /api/v1/companies/:slug/rate
 * @desc    Submit a rating for a company
 * @access  Public
 */
router.post('/:slug/rate', submitCompanyRating);

/**
 * @route   PATCH /api/v1/companies/approve
 * @desc    Approve a company (change status to active)
 * @access  Admin only (no middleware for test phase)
 */
router.patch('/approve', approveCompany);

/**
 * @route   PATCH /api/v1/companies/flag
 * @desc    Flag a company as suspicious (change status to flagged_scam)
 * @access  Admin only (no middleware for test phase)
 */
router.patch('/flag', flagCompany);

export default router;