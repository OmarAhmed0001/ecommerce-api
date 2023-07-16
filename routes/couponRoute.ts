import { Router } from 'express';
import {
    getCoupon,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} from '../controllers/CouponController';

import { protect, allowedTo } from '../controllers/AuthController';

const router = Router();
router.use(protect, allowedTo('admin', 'manager'));
router.route('/').get(getCoupons).post(createCoupon);
router.route('/:id').get(getCoupon).put(updateCoupon).delete(deleteCoupon);
export default router;
