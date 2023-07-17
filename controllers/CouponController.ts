import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './HandlersFactory';

import Coupon from '../models/couponModel';

// @desc    Get list of coupons
// @route   Get /api/v1/coupons
// @access  private admin/manager
export const getCoupons = getAll(Coupon);

// @desc    Get specific coupon by id
// @route   Get /api/v1/coupons/:id
// @access  private admin/manager
export const getCoupon = getOne(Coupon);

// @desc    Create list of coupons
// @route   Post /api/v1/coupons
// @access  private admin/manager
export const createCoupon = createOne(Coupon);

// @desc    Update specific coupon by id
// @route   PUT /api/v1/coupons/:id
// @access  private admin/manager
export const updateCoupon = updateOne(Coupon);
// @desc    Delete specific coupon by id
// @route   DELETE /api/v1/coupons/:id
// @access private admin/manager
export const deleteCoupon = deleteOne(Coupon);
