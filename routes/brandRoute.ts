import express from 'express';
import {
    getBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand,
    resizeBrandImage,
    uploadBrandImage,
} from '../controllers/BrandController';
import {
    createBrandValidator,
    deleteBrandValidator,
    getBrandValidator,
    updateBrandValidator,
} from '../utils/validators/brandValidator';
import { protect, allowedTo } from '../controllers/AuthController';

const router = express.Router();

router
    .route('/')
    .get(getBrands)
    .post(
        protect,
        allowedTo('admin', 'manager'),
        uploadBrandImage,
        resizeBrandImage,
        createBrandValidator,
        createBrand
    );
router
    .route('/:id')
    .get(getBrandValidator, getBrand)
    .put(
        protect,
        allowedTo('admin', 'manager'),
        uploadBrandImage,
        resizeBrandImage,
        updateBrandValidator,
        updateBrand
    )
    .delete(protect, allowedTo('admin'), deleteBrandValidator, deleteBrand);
export default router;
