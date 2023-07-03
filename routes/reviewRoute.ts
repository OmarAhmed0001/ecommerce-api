import express from 'express';
import {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    createFilterObject,
    setProductIdAndUserIdToBody,
} from '../controllers/ReviewController';
import {
    createReviewValidator,
    deleteReviewValidator,
    getReviewValidator,
    updateReviewValidator,
} from '../utils/validators/ReviewValidator';
import { protect, allowedTo } from '../controllers/AuthController';

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(createFilterObject, getReviews)
    .post(
        protect,
        allowedTo('user'),
        setProductIdAndUserIdToBody,
        createReviewValidator,
        createReview
    );
router
    .route('/:id')
    .get(getReviewValidator, getReview)
    .put(protect, allowedTo('user'), updateReviewValidator, updateReview)
    .delete(
        protect,
        allowedTo('user', 'manager', 'admin'),
        deleteReviewValidator,
        deleteReview
    );
export default router;
