import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
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
