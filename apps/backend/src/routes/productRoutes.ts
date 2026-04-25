import { Router } from 'express';
import {
  getProductsByCompany,
  addNewProduct,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController';

const router = Router();

/**
 * @route   GET /api/v1/products/company/:companySlug
 * @desc    Get all products for a specific company by company slug
 * @access  Public
 */
router.get('/company/:companySlug', getProductsByCompany);

/**
 * @route   POST /api/v1/products
 * @desc    Add a new product (for owners/admins)
 * @access  Private (for now public, add auth middleware later)
 */
router.post('/', addNewProduct);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   PATCH /api/v1/products/:id
 * @desc    Update a product (for owners/admins)
 * @access  Private (for now public, add auth middleware later)
 */
router.patch('/:id', updateProduct);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete a product (for owners/admins)
 * @access  Private (for now public, add auth middleware later)
 */
router.delete('/:id', deleteProduct);

export default router;