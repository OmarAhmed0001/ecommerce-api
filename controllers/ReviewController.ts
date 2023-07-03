import express from 'express';
import asyncHandler from 'express-async-handler';
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './HandlersFactory';
import Review from '../models/reviewModel';

// Nest Rout
// @route   Get /api/v1/products/:productId/reviews
export const createFilterObject = asyncHandler(
    async (req: express.Request, res: express.Response, next: Function) => {
        let filterObject = {};
        if (req.params.productId)
            filterObject = { product: req.params.productId };
        req.body.filterObject = filterObject;
        next();
    }
);

// @desc    Set product id to body
// @route   Get /api/v1/products/:productId/reviews
// @access  Public
// Nested Rout
export const setProductIdAndUserIdToBody = asyncHandler(
    async (req: express.Request, res: express.Response, next: Function) => {
        if (!req.body.product) {
            req.body.product = req.params.productId;
        }
        // in TS req.user === req.body.user so we don't need to set it
        if (!req.body.user) {
            req.body.user = req.body.user._id;
        }
        next();
    }
);

// @desc    Get list of Reviews
// @route   Get /api/v1/reviews
// @access  Public
export const getReviews = getAll(Review);

// @desc    Get specific Review by id
// @route   Get /api/v1/reviews/:id
// @access  Public
export const getReview = getOne(Review);

// @desc    Create list of Reviews
// @route   Post /api/v1/reviews
// @access  Private/Protected/User
export const createReview = createOne(Review);

// @desc    Update specific Review by id
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protected/User
export const updateReview = updateOne(Review);
// @desc    Delete specific Review by id
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protected/User-Admin-Manager
export const deleteReview = deleteOne(Review);

// @desc    Delete all Reviews
// @route   DELETE /api/v1/reviews
// @access  Private/Protected/User-Admin-Manager
export const deleteReviews = asyncHandler(
    async (req: express.Request, res: express.Response) => {
        await Review.deleteMany({});
        res.status(204).send();
    }
);
