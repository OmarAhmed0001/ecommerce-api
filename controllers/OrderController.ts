import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { getAll, getOne } from './HandlersFactory';
import ApiError from '../utils/apiError';
import Product from '../models/productModel';
import Cart from '../models/cartModel';
import Order from '../models/orderModel';

// @desc    Create cash order
// @route   POST /api/v1/orders/:cartId
// @access  Private/user
export const createCashOrder = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const shippingPrice = 0;
        const taxPrice = 0;
        //1) get cart from cartId
        const { cartId } = req.params;
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return next(
                new ApiError(`Cart not found with this id ${cartId}`, 404)
            );
        }
        //2) get order price from cart "check if coupon applied or not"
        const orderPrice = cart.totalPriceAfterDiscount
            ? cart.totalPriceAfterDiscount
            : cart.totalCartPrice;
        if (!orderPrice) {
            return next(new ApiError(`Cart is empty`, 404));
        }
        const totalOrderPrice = orderPrice + shippingPrice + taxPrice;
        //3) create order with default paymentMethodType = cash
        const order = await Order.create({
            cartItems: cart.cartItems,
            totalOrderPrice,
            shippingAddress: req.body.shippingAddress,
            user: req.body.user._id,
        });
        //4) after create order, decrease product quantity and increase sold
        if (order) {
            const bulkOption = cart.cartItems.map((item: any) => {
                return {
                    updateOne: {
                        filter: { _id: item.product },
                        update: {
                            $inc: {
                                quantity: -item.quantity,
                                sold: +item.quantity,
                            },
                        },
                    },
                };
            });
            await Product.bulkWrite(bulkOption, {});
        }
        //5) delete cart from db
        await Cart.findByIdAndDelete(cartId);

        res.status(201).json({
            status: 'success',
            message: 'Order created successfully.',
            data: order,
        });
    }
);

export const filterOrderForLoggedUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.user.role === 'user') {
            req.body.filterObject = { user: req.body.user._id };
        }
        next();
    }
);

// @desc    Create cash order
// @route   GET /api/v1/orders
// @access  Private/user-admin-manager
export const getAllOrders = getAll(Order);

// @desc    Create cash order
// @route   GET /api/v1/orders/:cartId
// @access  Private/user-admin-manager
export const getSpecificOrders = getOne(Order);

// @desc    update order payment status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private/admin-manager
export const updateOrderToPaid = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            return next(new ApiError(`Order not found with this id ${id}`, 404));
        }
        order.isPaid = true;
        order.paidAt = Date.now() as unknown as Date;
        const updatedOrder = await order.save();
        res.status(200).json({
            status: 'success',
            message: 'Order updated successfully.',
            data: updatedOrder,
        });
    }
);

// @desc    update order delivery status to delivered
// @route   PUT /api/v1/orders/:id/deliver
// @access  Private/admin-manager
export const updateOrderToDelivered = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            return next(new ApiError(`Order not found with this id ${id}`, 404));
        }
        order.isDelivered = true;
        order.deliveredAt = Date.now() as unknown as Date;
        const updatedOrder = await order.save();
        res.status(200).json({
            status: 'success',
            message: 'Order updated successfully.',
            data: updatedOrder,
        });
    }
);