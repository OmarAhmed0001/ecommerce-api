import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import ApiError from '../utils/apiError';

// @desc    Add address to addresses list
// @route   Post /api/v1/addresses
// @access  Private
export const addAddress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // $addToSet ==> add address to addresses array if address not exist
        const document = await User.findByIdAndUpdate(
            req.body.user._id,
            {
                $addToSet: { addresses: req.body },
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
                message: 'Address added successfully.',
                data: document.addresses,
            });
        }
    }
);

// @desc    remove Address from Addresses list
// @route   DELETE /api/v1/addresses/:id
// @access  Private
export const removeAddress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // $pull ==> remove productId to wishlist array if productId exist
        const document = await User.findByIdAndUpdate(
            req.body.user._id,
            {
                $pull: { addresses: { _id: req.params.addressId } },
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
                message: 'Address removed successfully.',
                data: document.addresses,
            });
        }
    }
);

// @desc    Get Logged User Addresses list
// @route   GET /api/v1/addresses
// @access  Private
export const getLoggedUserAddresses = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const document = await User.findById(req.body.user._id).populate(
            'addresses'
        );
        if (!document) {
            return next(
                new ApiError(
                    `there is no user for this id ${req.body.user._id}`,
                    404
                )
            );
        }
        res.status(200).json({
            status: 'success',
            message: 'User addresses list.',
            result: document.addresses.length,
            data: document.addresses,
        });
    }
);
