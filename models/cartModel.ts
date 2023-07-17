import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
    {
        cartItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: { type: Number, default: 1, required: true },
                price: { type: Number, required: true },
                color: { type: String, required: true },
            },
        ],
        totalCartPrice: { type: Number},
        totalPriceAfterDiscount: { type: Number},  
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

const cartModel = mongoose.model('Cart', cartSchema);
export default cartModel;
