import express from 'express';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './HandlersFactory';
import { uploadSingleImage } from '../middlewares/uploadImageMiddleware';
import Brand from '../models/brandModel';

// @desc    Upload Single image for brand
// @route   POST /api/v1/brands/:id/upload
// @access  Private
export const uploadBrandImage = uploadSingleImage('image');

// @desc    Resize image for brand (image processing)
// @route   POST /api/v1/brands/:id/resize
// @access  Private
export const resizeBrandImage = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
): Promise<void> => {
    if (!req.file) return next();

    const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/brands/${filename}`);

    req.body.image = filename;

    next();
};

// @desc    Get list of brands
// @route   Get /api/v1/brands
// @access  Public
export const getBrands = getAll(Brand);

// @desc    Get specific brand by id
// @route   Get /api/v1/brands/:id
// @access  Public
export const getBrand = getOne(Brand);

// @desc    Create list of brands
// @route   Post /api/v1/brands
// @access  Private
export const createBrand = createOne(Brand);

// @desc    Update specific brand by id
// @route   PUT /api/v1/brands/:id
// @access  Private
export const updateBrand = updateOne(Brand);
// @desc    Delete specific brand by id
// @route   DELETE /api/v1/brands/:id
// @access  Private
export const deleteBrand = deleteOne(Brand);

// @desc    Delete all brands
// @route   DELETE /api/v1/brands
// @access  Private
export const deleteBrands = asyncHandler(
    async (req: express.Request, res: express.Response) => {
        await Brand.deleteMany({});
        res.status(204).send();
    }
);
