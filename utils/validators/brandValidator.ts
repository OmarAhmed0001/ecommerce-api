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
import slugify from 'slugify';

export const getBrandValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid Brand id'),
    validatorMiddleware,
];

export const createBrandValidator: RequestHandler[] = [
    check('name')
        .notEmpty()
        .withMessage('Brand required')
        .isLength({ min: 2 })
        .withMessage('Too short name')
        .isLength({ max: 32 })
        .withMessage('Too long name')
        .custom((value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    validatorMiddleware,
];

export const updateBrandValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid Brand id'),
    body('name')
        .optional()
        .custom((value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    validatorMiddleware,
];

export const deleteBrandValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid Brand id'),
    validatorMiddleware,
];
// export default BrandValidator;
