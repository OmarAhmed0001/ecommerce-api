import express from 'express';
import {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
} from '../controllers/ReviewController';
import {
    createReviewValidator,
    deleteReviewValidator,
    getReviewValidator,
    updateReviewValidator,
} from '../utils/validators/ReviewValidator';
import { protect, allowedTo } from '../controllers/AuthController';

const router = express.Router();

router
    .route('/')
    .get(getReviews)
    .post(
        protect,
        allowedTo('user'),
        createReviewValidator,
        createReview
    );
router
    .route('/:id')
    .get(getReviewValidator, getReview)
    .put(
        protect,
        allowedTo('user'),
        updateReviewValidator,
        updateReview
    )
    .delete(protect, allowedTo('user','manager','admin'), deleteReviewValidator, deleteReview);
export default router;
