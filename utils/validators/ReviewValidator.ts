// Copyright 2023 oa147
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { body, check } from 'express-validator';
import { RequestHandler } from 'express';
import validatorMiddleware from '../../middlewares/validatorMiddleware';
import Review from '../../models/reviewModel';

export const createReviewValidator: RequestHandler[] = [
    check('title').optional(),
    check('rating')
        .notEmpty()
        .withMessage('rating value required')
        .isFloat({ min: 1, max: 5 })
        .withMessage('invalid rating value'),
    // check('user').optional().isMongoId().withMessage('invalid user id'),
    check('product')
        .isMongoId()
        .withMessage('invalid product id')
        .custom(async (value, { req }) => {
            // check if logged in user create review for this product before
            if (!req.body.user) {
                throw new Error('You must login first');
            }
            const review = await Review.findOne({
                product: value,
                user: req.body.user,
            });
            if (review) {
                throw new Error('You already review this product');
            }
            return true;
        }),
    validatorMiddleware,
];

export const getReviewValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid Review id'),
    validatorMiddleware,
];

export const updateReviewValidator: RequestHandler[] = [
    check('id')
        .isMongoId()
        .withMessage('invalid Review id')
        .custom(async (value, { req }) => {
            //check if logged in user is the review owner
            if (!req.body.user) {
                throw new Error('You must login first');
            }
            const review = await Review.findById(value);
            if (!review) {
                throw new Error(`No review found with id ${value}`);
            }
            console.log(review.user?._id, req.body.user._id);

            if (review.user?._id.toString() !== req.body.user._id.toString()) {
                throw new Error('You are not allowed to update this review');
            }
            return true;
        }),
    validatorMiddleware,
];

export const deleteReviewValidator: RequestHandler[] = [
    check('id')
        .isMongoId()
        .withMessage('invalid Review id')
        .custom(async (value, { req }) => {
            //check if logged in user is the review owner
            if (req.body.user.role === 'user') {
                const review = await Review.findById(value);
                if (!review) {
                    throw new Error(`No review found with id ${value}`);
                }
                console.log(review.user?._id, req.body.user._id);
                if (
                    review.user?._id.toString() !== req.body.user._id.toString()
                ) {
                    throw new Error(
                        'You are not allowed to delete this review'
                    );
                }
            }

            return true;
        }),
    validatorMiddleware,
];
// export default ReviewValidator;
