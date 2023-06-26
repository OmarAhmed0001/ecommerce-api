import express from 'express';

import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
    resizeCategoryImage,
} from '../controllers/CategoryController';
import { protect, allowedTo } from '../controllers/AuthController';
import {
    createCategoryValidator,
    deleteCategoryValidator,
    getCategoryValidator,
    updateCategoryValidator,
} from '../utils/validators/categoryValidator';
import SubCategoryRoute from './subCategoryRoute';

const router = express.Router();

router.use('/:categoryId/subcategories', SubCategoryRoute);

router
    .route('/')
    .get(getCategories)
    .post(
        protect,
        allowedTo('admin', 'manager'),
        uploadCategoryImage,
        resizeCategoryImage,
        createCategoryValidator,
        createCategory
    );
router
    .route('/:id')
    .get(getCategoryValidator, getCategory)
    .put(
        protect,
        allowedTo('admin', 'manager'),
        uploadCategoryImage,
        resizeCategoryImage,
        updateCategoryValidator,
        updateCategory
    )
    .delete(
        protect,
        allowedTo('admin'),
        deleteCategoryValidator,
        deleteCategory
    );
export default router;
