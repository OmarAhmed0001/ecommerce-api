import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError';
import Product from '../models/productModel';
import Coupon from '../models/couponModel';
import Cart from '../models/cartModel';

function caculateTotalCartPrice(cart: any) {
    // caculate total cart price
    cart.totalCartPrice = cart.cartItems.reduce(
        (acc: any, item: any) => acc + item.price * item.quantity,
        0
    );
}

// @desc    Add product to cart
// @route   Post /api/v1/cart
// @access  Private/user
export const addToCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { productId, color } = req.body;
        const product = await Product.findById(productId);
        let cart = await Cart.findOne({ user: req.body.user._id });
        if (product) {
            if (!cart) {
                cart = await Cart.create({
                    user: req.body.user._id,
                    cartItems: [
                        {
                            product: productId,
                            color,
                            price: product.price,
                        },
                    ],
                });
                res.status(200).json({
                    status: 'success',
                    message: 'Product added successfully.',
                    data: cart,
                });
            } else {
                const productExist = cart.cartItems.findIndex(
                    (item) =>
                        item.product.toString() === productId.toString() &&
                        item.color === color
                );
                if (productExist > -1) {
                    cart.cartItems[productExist].quantity += 1;
                } else {
                    cart.cartItems.push({
                        product: productId,
                        color,
                        price: product.price,
                        quantity: 1,
                    });
                }
            }
            // caculate total cart price
            caculateTotalCartPrice(cart);
            // caculate total price after discount
            // cart.totalPriceAfterDiscount = cart.totalCartPrice -
            //     (cart.totalCartPrice * product.discount) / 100;

            await cart.save();
            res.status(201).json({
                status: 'success',
                message: 'Product added successfully.',
                numOfCartItems: cart.cartItems.length,
                data: cart,
            });
        } else {
            return next(
                new ApiError(
                    `there is no product for this id ${productId}`,
                    404
                )
            );
        }
    }
);

// @desc    Get Logged User Cart
// @route   GET /api/v1/cart
// @access  Private/user
export const getLoggedUserCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const cart = await Cart.findOne({ user: req.body.user._id });
        // .populate('cartItems.product', 'title imageCover')
        // .populate('user', 'name email');
        if (cart) {
            res.status(200).json({
                status: 'success',
                message: 'User cart.',
                numOfCartItems: cart.cartItems.length,
                data: cart,
            });
        } else {
            return next(
                new ApiError(
                    `there is no cart for this user ${req.body.user._id}`,
                    404
                )
            );
        }
    }
);

// @desc    remove item from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
export const removeItemFromCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // $pull ==> remove itemId from cart array if itemId exist
        const cart = await Cart.findOneAndUpdate(
            { user: req.body.user._id },
            {
                $pull: { cartItems: { _id: req.params.itemId } },
            },
            { new: true }
        );
        if (!cart) {
            return next(
                new ApiError(
                    `there is no user for this id ${req.body.user._id}`,
                    404
                )
            );
        } else {
            // caculate total cart price
            caculateTotalCartPrice(cart);
            await cart.save();
            res.status(200).json({
                status: 'success',
                message: 'item removed successfully from your cartItems.',
                numOfCartItems: cart.cartItems.length,
                data: cart,
            });
        }
    }
);

// @desc    remove cart
// @route   DELETE /api/v1/cart
// @access  Private
export const removeCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const cart = await Cart.findOneAndRemove({ user: req.body.user._id });
        if (!cart) {
            return next(
                new ApiError(
                    `there is no user for this id ${req.body.user._id}`,
                    404
                )
            );
        } else {
            res.status(204).send();
        }
    }
);

// @desc    update item from cart
// @route   PUT /api/v1/cart/:itemId
// @access  Private
export const updateCartItemQuantity = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.body.user._id });
        if (!cart) {
            return next(
                new ApiError(
                    `there is no user for this id ${req.body.user._id}`,
                    404
                )
            );
        } else {
            let check = 0;
            cart.cartItems.forEach((item: any) => {
                if (item._id.toString() === req.params.itemId.toString()) {
                    item.quantity = quantity;
                    check = 1;
                }
            });
            if (check === 0) {
                return next(
                    new ApiError(
                        `there is no item for this id ${req.params.itemId}`,
                        404
                    )
                );
            }
            // caculate total cart price
            caculateTotalCartPrice(cart);
            await cart.save();
            res.status(200).json({
                status: 'success',
                message: 'item updated successfully from your cartItems.',
                numOfCartItems: cart.cartItems.length,
                data: cart,
            });
        }
    }
);

// @desc    apply coupon on logged user cart
// @route   PUT /api/v1/cart/applayCoupon
// @access  Private
export const applayCoupon = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { coupon } = req.body;
        const validCoupon = await Coupon.findOne({ name: coupon,expire:{$gte:Date.now()} });
        if (!validCoupon) {
            return next(
                new ApiError(`there is no coupon for this name ${coupon}`, 404)
            );
        } else {
            const cart = await Cart.findOne({ user: req.body.user._id });
            if (!cart) {
                return next(
                    new ApiError(
                        `there is no user for this id ${req.body.user._id}`,
                        404
                    )
                );
            } else {
                if (!cart.totalCartPrice) {
                    return next(
                        new ApiError(
                            `there is no items in your cart to apply coupon`,
                            404
                        )
                    );
                }
                if (!validCoupon.discount) {
                    return next(
                        new ApiError(
                            `you already applied coupon on your cart`,
                            404
                        )
                    );
                }
                // caculate total price after discount
                cart.totalPriceAfterDiscount =
                    cart.totalCartPrice -
                    (cart.totalCartPrice * validCoupon.discount) / 100;
                await cart.save();
                res.status(200).json({
                    status: 'success',
                    message: 'coupon applied successfully on your cart.',
                    numOfCartItems: cart.cartItems.length,
                    data: cart,
                });
            }
        }
    }
);
