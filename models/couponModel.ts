import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: true,
            uppercase: true,
            required: [true, 'Coupon name is required'],
        },
        expire: {
            type: Date,
            required: [true, 'Expiry date is required'],
        },
        discount: {
            type: Number,
            required: [true, 'Discount is required'],
        },
    },
    { timestamps: true }
);

const couponModel = mongoose.model('Coupon', couponSchema);
export default couponModel;
