import { Router } from 'express';
import {
    addToCart,
    getLoggedUserCart,
    removeItemFromCart,
    removeCart,
    updateCartItemQuantity,
    applyCoupon,
} from '../controllers/CartController';

import { protect, allowedTo } from '../controllers/AuthController';

const router = Router();
router.use(protect, allowedTo('user'));
router.route('/').post(addToCart).get(getLoggedUserCart).delete(removeCart);
router.route('/applyCoupon').put(applyCoupon);
router.route('/:itemId').put(updateCartItemQuantity).delete(removeItemFromCart);

export default router;
