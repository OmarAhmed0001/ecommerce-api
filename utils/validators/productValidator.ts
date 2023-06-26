import { body, check } from 'express-validator';
import validatorMiddleware from '../../middlewares/validatorMiddleware';
import Category from '../../models/categoryModel';
import SubCategory from '../../models/subCategoryModel';
import slugify from 'slugify';
import { RequestHandler } from 'express';
export const getProductValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid Product id'),
    validatorMiddleware,
];

export const createProductValidator: RequestHandler[] = [
    check('title')
        .notEmpty()
        .withMessage('Product required')
        .isLength({ min: 3 })
        .withMessage('Too short title')
        .isLength({ max: 100 })
        .withMessage('Too long title')
        .custom((value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    check('description')
        .notEmpty()
        .withMessage('Description required')
        .isLength({ min: 3 })
        .withMessage('Too short description')
        .isLength({ max: 2000 })
        .withMessage('Too long description'),
    check('quantity')
        .notEmpty()
        .withMessage('Quantity required')
        .isNumeric()
        .withMessage('Quantity must be a number'),
    check('sold').optional().isNumeric().withMessage('Sold must be a number'),
    check('price')
        .notEmpty()
        .withMessage('Price required')
        .isNumeric()
        .withMessage('Price must be a number')
        .isLength({ max: 32 })
        .withMessage('Too long price'),
    check('priceAfterDiscount')
        .optional()
        .isNumeric()
        .withMessage('Price after discount must be a number')
        .toFloat()
        .isLength({ max: 32 })
        .withMessage('Too long price after discount')
        .custom((value, { req }) => {
            if (req.body.price < value) {
                throw new Error('Price after discount must be less than price');
            }
            return true;
        }),
    check('colors').optional().isArray().withMessage('Colors must be an array'),
    check('imageCover').notEmpty().withMessage('Image cover required'),
    check('images').optional().isArray().withMessage('Images must be an array'),

    check('category')
        .notEmpty()
        .withMessage('Category required')
        .isMongoId()
        .withMessage('invalid Category id')
        .custom(async (categoryId) => {
            const category = await Category.findById(categoryId);
            if (!category) {
                return Promise.reject(
                    new Error(`Category not found with id ${categoryId}`)
                );
            }
        }),
    check('subcategory')
        .optional()
        .isArray()
        .withMessage('Subcategories must be an array of ids')
        .isMongoId()
        .withMessage('invalid Subcategory id format')
        .custom(async (subcategoryIds) => {
            const subcategories = await SubCategory.find({
                _id: { $exists: true, $in: subcategoryIds },
            });
            if (
                subcategories.length < 1 ||
                subcategories.length !== subcategoryIds.length
            ) {
                return Promise.reject(new Error(`Invalid Subcategories ids`));
            }
        })
        .custom(async (subcategoryIds, { req }) => {
            const subcategories = await SubCategory.find({
                category: req.body.category,
            });
            const subcategoryIdsInDB: String[] = [];
            subcategories.forEach((subcategory) => {
                subcategoryIdsInDB.push(subcategory._id.toString());
            });
            // check if subcategories ids in db include all subcategories ids in req.body (true/false)
            const checker = (target_1: String[], arr: String[]) =>
                target_1.every((id) => arr.includes(id));
            if (!checker(subcategoryIds, subcategoryIdsInDB)) {
                return Promise.reject(
                    new Error(`Subcategories must be belong to category`)
                );
            }
        }),
    // .withMessage('Subcategories must be belong to category')
    check('brand').optional().isMongoId().withMessage('invalid Brand id'),
    check('ratingAverage')
        .optional()
        .isNumeric()
        .withMessage('Rating must be a number')
        .isLength({ min: 1 })
        .withMessage('Too short rating')
        .isLength({ max: 5 })
        .withMessage('Too long rating'),
    check('ratingQuantity')
        .optional()
        .isNumeric()
        .withMessage('Rating quantity must be a number'),

    validatorMiddleware,
];

export const updateProductValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid Product id'),
    body('title')
        .optional()
        .custom((value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    validatorMiddleware,
];

export const deleteProductValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid Product id'),
    validatorMiddleware,
];
