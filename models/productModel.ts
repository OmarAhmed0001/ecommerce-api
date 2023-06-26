import { timeStamp } from 'console';
import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
import mongoose from 'mongoose';
// 1- Create Schema
const ProductSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true, // trim whitespace and when use it with unique it will not work it may work with no message in unique
            required: [true, 'Product required'],
            unique: true,
            minlength: [3, 'Too short name'],
            maxlength: [100, 'Too long name'],
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            minlength: [20, 'Too short description'],
            maxlength: [2000, 'Too long description'],
        },
        price: {
            type: Number,
            required: true,
            trim: true,
            max: [200000, 'Too long price'],
        },
        priceAfterDiscount: {
            type: Number,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Product must be belong to category'],
        },
        SubCategory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'SubCategory',
            },
        ],
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            //required: [true, 'Product must be belong to brand'],
        },
        quantity: {
            type: Number,
            required: [true, 'Product quantity is required'],
        },
        sold: {
            type: Number,
            default: 0,
        },
        colors: [String],
        imageCover: {
            type: String,
            required: [true, 'Product image cover is required'],
        },
        images: [String],
        shipping: {
            type: String,
            enum: ['Yes', 'No'],
        },
        ratingAverage: {
            type: Number,
            default: 0,
            min: [0, 'Rating must be above or equal 0'],
            max: [5, 'Rating must be below or equal 5'],
        },
        ratingQuantity: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Mooongose query middleware
ProductSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'category',
        select: 'name-_id',
    })
        .populate({
            path: 'SubCategory',
            select: 'name-_id',
        })
        .populate({
            path: 'brand',
            select: 'name-_id',
        });
    next();
});
const { IMAGE_BASE_URL } = process.env;

const setImageURL = (doc: any) => {
    // return image based url + image name
    if (doc.imageCover) {
        doc.imageCover = `${IMAGE_BASE_URL}/products/${doc.imageCover}`;
    }
    if (doc.images) {
        doc.images = doc.images.map((image: any) => {
            return `${IMAGE_BASE_URL}/products/${image}`;
        });
    }
};

// FindAll , FindById , Update
ProductSchema.post('init', (doc) => {
    setImageURL(doc);
});
//  Create
ProductSchema.post('save', (doc) => {
    setImageURL(doc);
});

// 2- Create Model
const ProductModel = mongoose.model('Product', ProductSchema);

export default ProductModel;
