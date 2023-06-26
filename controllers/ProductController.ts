import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import ApiError from '../utils/apiError';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './HandlersFactory';
import {uploadMixOfImages} from '../middlewares/uploadImageMiddleware';
import Product from '../models/productModel';


export const uploadProductImages = uploadMixOfImages([
    { name: 'images', maxCount: 5 },
    { name: 'imageCover', maxCount: 1 },
]);

// @desc    Resize Product Images

export const resizeProductImages = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined;

    if (!files || !('images' in files) || !('imageCover' in files)) {
        return next();
    }

    // 1) Cover image
    const imageCoverFiles = Array.isArray(files.imageCover)
        ? files.imageCover
        : [files.imageCover];
    req.body.imageCover = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(imageCoverFiles[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`uploads/products/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];
    const imageFiles = Array.isArray(files.images)
        ? files.images
        : [files.images];
    await Promise.all(
        imageFiles.map(async (file: Express.Multer.File, i: number) => {
            const filename = `product-${uuidv4()}-${Date.now()}-${i + 1}.jpeg`;
            await sharp(file.buffer)
                .resize(500, 500)
                .toFormat('jpeg')
                .jpeg({ quality: 95 })
                .toFile(`uploads/products/${filename}`);
            req.body.images.push(filename);
        })
    );

    next();
};

// @desc    Get list of Products
// @route   Get /api/v1/Products
// @access  Public
export const getProducts = getAll(Product, 'Product');

// @desc    Get specific Product by id
// @route   Get /api/v1/Products/:id
// @access  Public
export const getProduct = getOne(Product);

// @desc    Create list of Products
// @route   Post /api/v1/Products
// @access  Private
export const createProduct = createOne(Product);

// @desc    Update specific Product by id
// @route   PUT /api/v1/Products/:id
// @access  Private
export const updateProduct = updateOne(Product);

// @desc    Delete specific Product by id
// @route   DELETE /api/v1/Products/:id
// @access  Private
export const deleteProduct = deleteOne(Product);

// @desc    Delete all Products
// @route   DELETE /api/v1/Products
// @access  Private
export const deleteProducts = asyncHandler(
    async (req: Request, res: Response) => {
        await Product.deleteMany({});
        res.status(204).send();
    }
);

// @desc    Get Count of Products
// @route   Get /api/v1/Products
// @access  Public
export const getProductsCount = asyncHandler(
    async (req: Request, res: Response) => {
        const count = await Product.find({}).estimatedDocumentCount();
        res.status(200).json({ count });
    }
);
