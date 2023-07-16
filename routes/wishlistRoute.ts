import express from 'express';
import {
    addProductToWishlist,
    removeProductFromWishlist,
    getLoggedUserWishlist,
} from '../controllers/WishlistController';

import { protect, allowedTo } from '../controllers/AuthController';

const router = express.Router();
router.use(protect, allowedTo('user'));

router.route('/').post(addProductToWishlist).get(getLoggedUserWishlist);
router.route('/:productId').delete(removeProductFromWishlist);
export default router;
