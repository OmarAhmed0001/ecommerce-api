import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import {
    createOne,
    deleteOne,
    updateOne,
    getOne,
    getAll,
} from './HandlersFactory';
import {uploadSingleImage} from '../middlewares/uploadImageMiddleware';
import Category from '../models/categoryModel';

// @desc    Upload Single image for category
// @route   POST /api/v1/categories/:id/upload
// @access  Private
export const uploadCategoryImage = uploadSingleImage("image");

// @desc    Resize image for category (image processing)
// @route   POST /api/v1/categories/:id/resize
// @access  Private
export const resizeCategoryImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) return next();
    
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);
  
    req.body.image = filename;
  
    next();
  };

// @desc    Get list of categories
// @route   Get /api/v1/categories
// @access  Public
export const getCategories = getAll(Category);

// @desc    Get specific category by id
// @route   Get /api/v1/categories/:id
// @access  Public
export const getCategory = getOne(Category);

// @desc    Create list of categories
// @route   Post /api/v1/categories
// @access  Private
export const createCategory = createOne(Category);

// @desc    Update specific category by id
// @route   PUT /api/v1/categories/:id
// @access  Private
export const updateCategory = updateOne(Category);

// @desc    Delete specific category by id
// @route   DELETE /api/v1/categories/:id
// @access  Private
export const deleteCategory = deleteOne(Category);

// @desc    Delete all categories
// @route   DELETE /api/v1/categories
// @access  Private
export const deleteCategories = asyncHandler(
    async (req: Request, res: Response) => {
        await Category.deleteMany({});
        res.status(204).send();
    }
);

// @desc    Get Count of categories
// @route   Get /api/v1/categories
// @access  Public
export const getCategoriesCount = asyncHandler(
    async (req: Request, res: Response) => {
        const count = await Category.find({}).estimatedDocumentCount();
        res.status(200).json({ count });
    }
);
