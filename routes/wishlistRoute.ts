import express from 'express';
import { addProductToWishlist } from '../controllers/WishlistController';

import { protect, allowedTo } from '../controllers/AuthController';

const router = express.Router();

router
    .route('/')
    .post(protect, allowedTo('user'), addProductToWishlist);
// router
//     .route('/:id')
//     .get(getBrandValidator, getBrand)
//     .put(
//         protect,
//         allowedTo('admin', 'manager'),
//         updateBrand
//     )
//     .delete(protect, allowedTo('admin'), deleteBrandValidator, deleteBrand);
export default router;
