import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Order must belong to a user.'],
        },
        cartItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                color: { type: String, required: true },
            },
        ],

        paymentMethodType: {
            type: String,
            enum: ['card', 'cash'],
            default: 'cash',
        },
        shippingPrice: { type: Number, default: 0 },
        taxPrice: { type: Number, default: 0 },
        totalOrderPrice: { type: Number },

        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },

        shippingAddress: {
            address: { type: String },
            city: { type: String },
            postalCode: { type: String },
            phone: { type: String },
        },
        // paymentResult: {
        //     id: String,
        //     status: String,
        //     update_time: String,
        //     email_address: String,
        // },
        // itemsPrice: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name email phone profilePic',
    }).populate({
        path: 'cartItems.product',
        select: 'title imageCover',
    });
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
