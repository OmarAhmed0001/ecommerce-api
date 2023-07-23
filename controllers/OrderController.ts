import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2022-11-15',
});
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { getAll, getOne } from './HandlersFactory';
import ApiError from '../utils/apiError';
import Product from '../models/productModel';
import Cart from '../models/cartModel';
import Order from '../models/orderModel';
import User from '../models/userModel';
import { log } from 'console';

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
            return next(
                new ApiError(`Order not found with this id ${id}`, 404)
            );
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
            return next(
                new ApiError(`Order not found with this id ${id}`, 404)
            );
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

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/checkout-session/:cartId
// @access  Private/user
export const checkoutSession = asyncHandler(
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
        //3) create stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        //egyptian pound
                        currency: 'egp',
                        product_data: {
                            name: req.body.user.name,
                            images: [req.body.user.profilePic],
                        },
                        unit_amount: totalOrderPrice * 100,
                    },

                    quantity: 1,
                },
            ],
            customer_email: req.body.user.email,
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/api/v1/orders`,
            cancel_url: `${req.protocol}://${req.get('host')}/api/v1/cart`,
            client_reference_id: cartId,
            metadata: req.body.shippingAddress,
        });
        console.log(req.body.user.profilePic);
        //4) send session as response
        res.status(200).json({
            status: 'success',
            message: 'Checkout session created successfully.',
            session,
        });
    }
);
const createCardOrder = async (session: any) => {
    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata;
    const totalOrderPrice = session.amount_total / 100;
    console.log(cartId, shippingAddress, totalOrderPrice);
    //1) get cart from cartId
    const cart = await Cart.findById(session.client_reference_id);
    const user = await User.findOne({ email: session.customer_email });

    //3) create order with default paymentMethodType = card
    const order = await Order.create({
        cartItems: cart?.cartItems,
        totalOrderPrice,
        shippingAddress,
        user: user?._id,
        isPaid: true,
        paidAt: Date.now() as unknown as Date,
    });
    //4) after create order, decrease product quantity and increase sold
    if (order && cart) {
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
};
// @desc    Create order after checkout session completed
// @route   POST /webhook-checkout
// @access  Private/user
export const webhookCheckout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const sig = req.headers['stripe-signature'] as any;

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET as string
            );
        } catch (err: any) {
            // Explicitly type the "err" variable as "any" or "unknown" (if you are sure it will always be an error).
            return next(new ApiError(`Webhook error ${err}`, 400));
        }

        if (event.type === 'checkout.session.completed') {
            console.log('checkout session completed');
            await createCardOrder(event.data.object);
        }
        res.status(200).json({ received: true });
    }
);
