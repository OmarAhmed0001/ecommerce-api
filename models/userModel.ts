import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
import mongoose from 'mongoose';
import { hash_password } from '../middlewares/hash-password';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'name required'],
            trim: true,
        },
        slug: {
            type: String,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'email required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'phone required'],
            unique: true,
            trim: true,
        },
        profilePic: {
            type: String,
        },
        password: {
            type: String,
            required: true,
            minLength: [6, 'password must be at least 6 characters'],
        },
        passwordChangedAt: {
            type: Date,
        },
        passwordResetCode: {
            type: String,
        },
        passwordResetExpires: {
            type: Date,
        },
        passwordResetVerified: {
            type: Boolean,
        },
        role: {
            type: String,
            enum: ['user', 'manager', 'admin'],
            default: 'user',
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const { IMAGE_BASE_URL } = process.env;

const setImageURL = (doc: any) => {
    // return image based url + image name
    if (doc.profilePic) {
        doc.profilePic = `${IMAGE_BASE_URL}/users/${doc.profilePic}`;
    }
};

// FindAll , FindById , Update
UserSchema.post('init', (doc) => {
    setImageURL(doc);
});
//  Create
UserSchema.post('save', (doc) => {
    setImageURL(doc);
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    // Hash password
    this.password = hash_password(this.password);
    next();
});
const User = mongoose.model('User', UserSchema);
export default User;
