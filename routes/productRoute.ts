import express from 'express';
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
    uploadProductImages,
    resizeProductImages,
} from '../controllers/ProductController';
import {
    createProductValidator,
    deleteProductValidator,
    getProductValidator,
    updateProductValidator,
} from '../utils/validators/productValidator';
import { protect, allowedTo } from '../controllers/AuthController';

const router = express.Router();

router
    .route('/')
    .get(getProducts)
    .post(
        protect,
        allowedTo('admin', 'manager'),
        uploadProductImages,
        resizeProductImages,
        createProductValidator,
        createProduct
    );
router
    .route('/:id')
    .get(getProductValidator, getProduct)
    .put(
        protect,
        allowedTo('admin', 'manager'),
        uploadProductImages,
        resizeProductImages,
        updateProductValidator,
        updateProduct
    )
    .delete(
        protect,
        allowedTo('admin'),
        deleteProductValidator,
        deleteProduct
    );
export default router;
