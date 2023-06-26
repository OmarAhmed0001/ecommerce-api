import SubCategory from '../models/subCategoryModel';
import express from 'express';
import asyncHandler from 'express-async-handler';
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './HandlersFactory';

// Nest Rout
// @route   Get /api/v1/categories/:categoryId/subcategories
export const createFilterObject = asyncHandler(
    async (req: express.Request, res: express.Response, next: Function) => {
        let filterObject = {};
        if (req.params.categoryId)
            filterObject = { category: req.params.categoryId };
        req.body.filterObject = filterObject;
        next();
    }
);

// @desc    Set category id to body
// @route   Get /api/v1/categories/:categoryId/subcategories
// @access  Public
// Nested Rout
export const setCategoryIdToBody = asyncHandler(
    async (req: express.Request, res: express.Response, next: Function) => {
        if (!req.body.category) {
            req.body.category = req.params.categoryId;
        }
        next();
    }
);

// @desc    Get list of subcategories
// @route   Get /api/v1/subcategories
// @access  Public
export const getSubCategories = getAll(SubCategory);

// @desc    Get specific subcategory by id
// @route   Get /api/v1/subcategories/:id
// @access  Public
export const getSubCategory = getOne(SubCategory);

// @desc    Create list of SubCategory
// @route   Post /api/v1/subcategories
// @access  Private
export const createSubCategory = createOne(SubCategory);

// @desc    Update specific Subcategory by id
// @route   PUT /api/v1/subcategories/:id
// @access  Private
export const updateSubCategory = updateOne(SubCategory);

// @desc    Delete specific category by id
// @route   DELETE /api/v1/categories/:id
// @access  Private
export const deleteSubCategory = deleteOne(SubCategory);
