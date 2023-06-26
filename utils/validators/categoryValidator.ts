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
import validatorMiddleware from '../../middlewares/validatorMiddleware';
import slugify from 'slugify';
import { RequestHandler } from 'express';

export const getCategoryValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid category id'),
    validatorMiddleware,
];

export const createCategoryValidator: RequestHandler[] = [
    check('name')
        .notEmpty()
        .withMessage('Category required')
        .isLength({ min: 3 })
        .withMessage('Too short name')
        .isLength({ max: 32 })
        .withMessage('Too long name')
        .custom((value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    validatorMiddleware,
];

export const updateCategoryValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid category id'),
    body('name')
        .optional()
        .custom((value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    validatorMiddleware,
];

export const deleteCategoryValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid category id'),
    validatorMiddleware,
];
// export default categoryValidator;
