import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Company } from '../models/Company';
import AppError from '../utils/AppError';

/**
 * Get all products for a specific company by company slug
 * GET /api/v1/products/company/:companySlug
 */
export const getProductsByCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companySlug } = req.params;

    // Input validation
    if (!companySlug || typeof companySlug !== 'string') {
      throw new AppError('Valid company slug is required', 400);
    }

    // Find the company by slug
    const company = await Company.findOne({ slug: companySlug });

    if (!company) {
      throw new AppError('Company not found', 404);
    }

    // Find all products for this company
    const products = await Product.find({ companyRef: company._id })
      .select('-__v')
      .sort({ createdAt: -1 }); // Newest first

    // Return the products
    res.status(200).json({
      status: 'success',
      data: {
        company: {
          _id: company._id,
          companyName: company.companyName,
          slug: company.slug,
          category: company.category
        },
        products,
        count: products.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new product (for owners/admins)
 * POST /api/v1/products
 */
export const addNewProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      productName,
      companyRef,
      price,
      category,
      imageUrl,
      description,
      status
    } = req.body;

    // Input validation
    if (!productName || !companyRef || price === undefined) {
      throw new AppError('Product name, company reference, and price are required', 400);
    }

    // Validate price is a number and non-negative
    if (typeof price !== 'number' || price < 0) {
      throw new AppError('Price must be a non-negative number', 400);
    }

    // Validate company exists
    const company = await Company.findById(companyRef);
    if (!company) {
      throw new AppError('Referenced company does not exist', 404);
    }

    // Check if product with same name already exists for this company
    const existingProduct = await Product.findOne({
      productName,
      companyRef
    });

    if (existingProduct) {
      throw new AppError('A product with this name already exists for this company', 409);
    }

    // Validate category if provided
    const validCategories = ['StarterKit', 'Software', 'PhysicalGoods', 'Subscription', 'Other'];
    if (category && !validCategories.includes(category)) {
      throw new AppError(`Category must be one of: ${validCategories.join(', ')}`, 400);
    }

    // Validate status if provided
    const validStatuses = ['active', 'out_of_stock', 'discontinued'];
    if (status && !validStatuses.includes(status)) {
      throw new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Create new product
    const newProduct = new Product({
      productName,
      companyRef,
      price,
      category: category || 'Other',
      imageUrl: imageUrl || '',
      description: description || '',
      status: status || 'active'
    });

    // Save to database
    const savedProduct = await newProduct.save();

    // Return the created product
    res.status(201).json({
      status: 'success',
      data: {
        product: savedProduct
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by ID
 * GET /api/v1/products/:id
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('companyRef', 'companyName slug category logoUrl')
      .select('-__v');

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product (for owners/admins)
 * PATCH /api/v1/products/:id
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Validate category if provided in update
    if (updateData.category) {
      const validCategories = ['StarterKit', 'Software', 'PhysicalGoods', 'Subscription', 'Other'];
      if (!validCategories.includes(updateData.category)) {
        throw new AppError(`Category must be one of: ${validCategories.join(', ')}`, 400);
      }
    }

    // Validate status if provided in update
    if (updateData.status) {
      const validStatuses = ['active', 'out_of_stock', 'discontinued'];
      if (!validStatuses.includes(updateData.status)) {
        throw new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400);
      }
    }

    // Validate price if provided
    if (updateData.price !== undefined) {
      if (typeof updateData.price !== 'number' || updateData.price < 0) {
        throw new AppError('Price must be a non-negative number', 400);
      }
    }

    // If productName is being updated, check for duplicates within the same company
    if (updateData.productName && updateData.productName !== product.productName) {
      const existingProduct = await Product.findOne({
        productName: updateData.productName,
        companyRef: product.companyRef,
        _id: { $ne: id } // Exclude current product
      });

      if (existingProduct) {
        throw new AppError('A product with this name already exists for this company', 409);
      }
    }

    // Update the product
    Object.assign(product, updateData);
    const updatedProduct = await product.save();

    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product (for owners/admins)
 * DELETE /api/v1/products/:id
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};