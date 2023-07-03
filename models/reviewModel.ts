import { timeStamp } from 'console';
import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
import mongoose from 'mongoose';

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

// 2- Create Model
const ReviewModel = mongoose.model('Review', ReviewSchema);

export default ReviewModel;
