import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import ApiError from '../utils/apiError';

// @desc    Add Product to wishlist
// @route   Post /api/v1/wishlist
// @access  Private
export const addProductToWishlist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // $addToSet ==> add productId to wishlist array if productId not exist
        const document = await User.findByIdAndUpdate(
            req.body.user._id,
            {
                $addToSet: { wishlist: req.body.productId },
            },
            { new: true }
        );
        if (!document) {
            //res.status(404).json({msg:`there is no brand for this id ${id}`})
            return next(
                new ApiError(
                    `there is no user for this id ${req.body.user._id}`,
                    404
                )
            );
        } else {
            res.status(200).json({
                status: 'success',
                message: 'Product added successfully to your wishlist.',
                data: document.wishlist,
            });
        }
    }
);

// @desc    remove Product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private
export const removeProductFromWishlist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // $pull ==> remove productId to wishlist array if productId exist
        const document = await User.findByIdAndUpdate(
            req.body.user._id,
            {
                $pull: { wishlist: req.params.productId },
            },
            { new: true }
        );
        if (!document) {
            //res.status(404).json({msg:`there is no brand for this id ${id}`})
            return next(
                new ApiError(
                    `there is no user for this id ${req.body.user._id}`,
                    404
                )
            );
        } else {
            res.status(200).json({
                status: 'success',
                message: 'Product added successfully to your wishlist.',
                data: document.wishlist,
            });
        }
    }
);