import express from 'express';
import {
    createSubCategory,
    getSubCategories,
    getSubCategory,
    updateSubCategory,
    deleteSubCategory,
    setCategoryIdToBody,
    createFilterObject,
} from '../controllers/SubCategoryController';
import {
    createSubCategoryValidator,
    getSubCategoryValidator,
    updateSubCategoryValidator,
    deleteSubCategoryValidator,
} from '../utils/validators/subCategoryValidator';
import { protect, allowedTo } from '../controllers/AuthController';

//mergeParams Allow us to access parameters on other routers

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(createFilterObject, getSubCategories)
    .post(
        protect,
        allowedTo('admin', 'manager'),
        setCategoryIdToBody,
        createSubCategoryValidator,
        createSubCategory
    );

router
    .route('/:id')
    .get(getSubCategoryValidator, getSubCategory)
    .put(
        protect,
        allowedTo('admin', 'manager'),
        updateSubCategoryValidator,
        updateSubCategory
    )
    .delete(
        protect,
        allowedTo('admin'),
        deleteSubCategoryValidator,
        deleteSubCategory
    );
export default router;
