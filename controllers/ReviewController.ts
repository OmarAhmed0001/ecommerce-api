import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './HandlersFactory';
import Review from '../models/reviewModel';





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
