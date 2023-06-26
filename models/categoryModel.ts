import { timeStamp } from 'console';
import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
import mongoose from 'mongoose';

// 1- Create Schema
const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            //trim: true, // trim whitespace and when use it with unique it will not work it may work with no message in unique
            required: [true, 'Category required'],
            unique: [true, 'Category must be unique'],
            minlength: [3, 'Too short name'],
            maxlength: [32, 'Too long name'],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
);
const { IMAGE_BASE_URL } = process.env;

const setImageURL = (doc: any) => {
    // return image based url + image name
    if (doc.image) {
        doc.image = `${IMAGE_BASE_URL}/categories/${doc.image}`;
    }
};

// FindAll , FindById , Update
CategorySchema.post('init', (doc) => {
    setImageURL(doc);
});
//  Create
CategorySchema.post('save', (doc) => {
    setImageURL(doc);
});
// 2- Create Model
const CategoryModel = mongoose.model('Category', CategorySchema);

//export const CategoryModel = mongoose.model('Category', CategorySchema);

export default CategoryModel;
