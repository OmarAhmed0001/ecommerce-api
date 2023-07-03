import { timeStamp } from 'console';
import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
import mongoose from 'mongoose';
import Product from './productModel';
// 1- Create Schema
const ReviewSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            //trim: true, // trim whitespace and when use it with unique it will not work it may work with no message in unique
            required: [true, 'Review required'],
        },
        rating: {
            type: Number,
            min: [1, 'Min Ratings value is 1.0'],
            max: [5, 'Max Ratings value is 5.0'],
            required: [true, 'Rating required'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User required'],
        },
        // parent referencing (one to many)
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product required'],
        },
    },
    { timestamps: true }
);

ReviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name profilePic',
    });
    next();
});

ReviewSchema.statics.calcAverageRatingsAndQuantity = async function (
    productId: string
) {
    const stats = await this.aggregate([
        // stage 1 get all reviews in specific product
        {
            $match: { product: productId },
        },
        // stage 2 calculate average and sum of ratings
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    const { nRating, avgRating } =
        stats.length > 0 ? stats[0] : { nRating: 0, avgRating: 0 };

    await Product.findByIdAndUpdate(productId, {
        ratingQuantity: nRating,
        ratingAverage: avgRating,
    });
};

ReviewSchema.post('save', async function () {
    // this points to current review
    // this.constructor points to ReviewModel
    const reviewModel = this.constructor as any;
    await reviewModel.calcAverageRatingsAndQuantity(this.product);
});

ReviewSchema.post('remove', async function () {
    // this points to current review
    // this.constructor points to ReviewModel
    const reviewModel = this.constructor as any;
    await reviewModel.calcAverageRatingsAndQuantity(this.getQuery().product);
});
// 2- Create Model
const ReviewModel = mongoose.model('Review', ReviewSchema);

export default ReviewModel;
