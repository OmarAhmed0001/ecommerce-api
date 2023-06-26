import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
import { uploadSingleImage } from '../middlewares/uploadImageMiddleware';
import createToken from '../utils/createToken';
import ApiError from '../utils/apiError';
import sendEmail from '../utils/sendEmail';
import User from '../models/userModel';


// @desc    Sign up
// @route   Post /api/v1/auth/signup
// @access  public
export const signup = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // 1) Create user
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            profilePic: req.body.profilePic,
        });
        // 2) Generate token
        const token = createToken(user._id);
        res.status(201).json({ data: user, token });
    }
);

// @desc    login
// @route   Post /api/v1/auth/login
// @access  public
export const login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // 1) Check if email and password in body (validation)
        // 2) Check if user exist and password is correct
        const user = await User.findOne({ email: req.body.email }).select(
            '+password'
        );
        if (
            !user ||
            !(await bcrypt.compare(
                req.body.password + process.env.BCRYPT_PASSWORD,
                user.password
            ))
        ) {
            return next(new ApiError('Invalid email or password', 401));
        }
        // 3) Generate token
        const token = createToken(user._id);
        // 4) Send response to client
        res.status(200).json({ data: user, token });
    }
);

// @desc make sure user is logged in
export const protect = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // 1) Check if token in headers
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new ApiError('You are not logged in', 401));
        }

        try {
            // 2) Verify token
            const decoded = jwt.verify(token, `${process.env.jWT_SECRET}`);

            if (typeof decoded === 'string') {
                throw new Error('Invalid token');
            }

            // 3) Check if user still exists
            const currentUser = await User.findById(decoded.userId);
            if (!currentUser) {
                return next(
                    new ApiError(
                        'The user belonging to this token does not exist',
                        401
                    )
                );
            }
            if (typeof decoded.iat !== 'number') {
                throw new Error('Invalid token payload iat');
            }
            // 4) Check if user changed password after the token was issued
            if (currentUser.passwordChangedAt) {
                const passChangedTimestamp: string = (
                    currentUser.passwordChangedAt.getTime() / 1000
                ).toString();
                // Password changed after token was created
                if (decoded.iat < parseInt(passChangedTimestamp, 10)) {
                    return next(
                        new ApiError(
                            'User recently changed password! Please log in again',
                            401
                        )
                    );
                }
            }
            // 5) Grant access to protected route
            req.body.user = currentUser;
            next();
        } catch (err) {
            return next(new ApiError('Invalid token', 401));
        }
    }
);
// @desc    Authorization (permission)
// @route   Private
// @access  Private
export const allowedTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // roles ['admin', 'manager']
        if (!roles.includes(req.body.user.role)) {
            return next(
                new ApiError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }
        next();
    };
};
// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
export const forgotPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // 1) Get user based on POSTed email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return next(new ApiError('There is no user with that email', 404));
        }

        // 2) Generate the hash random 6-digit code and save it to the user's document
        const resetCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();
        const hashedResetCode = await crypto
            .createHash('sha256')
            .update(resetCode)
            .digest('hex');

        user.passwordResetCode = hashedResetCode;
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Set expiration date 10 minutes from now
        user.passwordResetVerified = false;
        await user.save();
        const subject = 'E-commerce Password Reset Code - Action Required';
        const message = `Dear ${user.name},\n\n
        You recently requested to reset your password for your E-commerce account. To proceed with the password reset, please use the following reset code:\n\n
        Reset Code: ${resetCode}\n\n
        Please note that this code is valid for a limited time only. If you don't reset your password within 10 minutes, you will need to request a new reset code.\n\n
        If you did not request this password reset, please ignore this email. Your account is still secure.\n\n
        Thank you,\n
        The E-commerce Team`;
        // 3) Send the reset code to the user's email
        try {
            await sendEmail({
                email: user.email,
                subject,
                message,
            });
        } catch (err) {
            user.passwordResetCode = undefined;
            user.passwordResetExpires = undefined;
            user.passwordResetVerified = false;
            await user.save();
            return next(
                new ApiError(
                    'There was an error sending the email. Try again later!',
                    500
                )
            );
        }
        // 4) Send response to the client
        res.status(200).json({
            status: 'success',
            message: 'Reset code sent to email',
        });
    }
);
// @desc    verify Password ResetCode
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
export const verifyPasswordResetCode = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // 1) Get user based on resetCode
        // console.log(req.body.resetCode);
        const hashedResetCode = await crypto
            .createHash('sha256')
            .update(req.body.resetCode)
            .digest('hex');
        // console.log(hashedResetCode);
        const user = await User.findOne({
            passwordResetCode: hashedResetCode,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) {
            return next(new ApiError(' Reset Code Invalid or Expired', 400));
        }
        // 2) If there is a user, verify the reset code
        user.passwordResetVerified = true;
        await user.save();
        // 3) Send response to the client
        res.status(200).json({
            status: 'success',
            message: 'Reset code verified',
        });
    }
);
// @desc    Reset Password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
export const resetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // 1) Get user based on email
        const user = await User.findOne({
            email: req.body.email,
        });
        if (!user) {
            return next(
                new ApiError(
                    `There is no user with email:${req.body.email} `,
                    404
                )
            );
        }
        if (!user.passwordResetVerified) {
            return next(new ApiError('Reset code not verified', 400));
        }
        // 2) Update password
        user.password = req.body.password;
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = false;
        await user.save();
        // 3) Generate token if everything is ok
        const token = createToken(user._id);
        // 4) Send response to the client
        res.status(200).json({
            status: 'success',
            message: 'Password reset successful',
            token,
        });
    }
);
// @desc    Upload Single image for User
// @route   POST /api/v1/Users/:id/upload
// @access  Private
export const uploadSignupImage = uploadSingleImage('profilePic');

// @desc    Resize image for User (image processing)
// @route   POST /api/v1/Users/:id/resize
// @access  Private
export const resizeSignupImage = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.file) return next();

    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
    if (req.file.buffer) {
        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`uploads/users/${filename}`);

        req.body.profilePic = filename;
    }

    next();
};
