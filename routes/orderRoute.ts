import { Router } from 'express';
import {
    createCashOrder,
    getAllOrders,
    getSpecificOrders,
    updateOrderToPaid,
    updateOrderToDelivered,
    checkoutSession
} from '../controllers/OrderController';

import { protect, allowedTo } from '../controllers/AuthController';

const router = Router();
router.use(protect);
router.route('/').get(allowedTo('admin', 'user', 'manager'), getAllOrders);
router.route('/checkout-session/:cartId').get(allowedTo( 'user'), checkoutSession);
router
    .route('/:id')
    .get(allowedTo('admin', 'user', 'manager'), getSpecificOrders);
router.route('/:id/pay').put(allowedTo('admin', 'manager'), updateOrderToPaid);
router
    .route('/:id/deliver')
    .put(allowedTo('admin', 'manager'), updateOrderToDelivered);
router.route('/:cartId').post(allowedTo('user'), createCashOrder);

export default router;
