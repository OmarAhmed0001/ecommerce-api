import express from 'express';
import {
    addProductToWishlist,
    removeProductFromWishlist,
} from '../controllers/WishlistController';

import { protect, allowedTo } from '../controllers/AuthController';

const router = express.Router();

router.route('/').post(protect, allowedTo('user'), addProductToWishlist);
router
    .route('/:productId')
    .delete(protect, allowedTo('user'), removeProductFromWishlist);
export default router;
