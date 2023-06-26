import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import { createOne, deleteOne, getAll, getOne } from './HandlersFactory';
import { uploadSingleImage } from '../middlewares/uploadImageMiddleware';
import User from '../models/userModel';
import ApiError from '../utils/apiError';
import { hash_password } from '../middlewares/hash-password';
import createToken from '../utils/createToken';

// @desc    Upload Single image for User
// @route   POST /api/v1/Users/:id/upload
// @access  Private
export const uploadUserImage = uploadSingleImage('profilePic');

// @desc    Resize image for User (image processing)
// @route   POST /api/v1/Users/:id/resize
// @access  Private
export const resizeUserImage = async (
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

// @desc    Get list of users
// @route   Get /api/v1/users
// @access  Private
export const getUsers = getAll(User);

// @desc    Get specific users by id
// @route   Get /api/v1/users/:id
// @access  Private
export const getUser = getOne(User);

// @desc    Create list of users
// @route   Post /api/v1/users
// @access  Private
export const createUser = createOne(User);

// @desc    Update specific users by id
// @route   PUT /api/v1/users/:id
// @access  Private
export const updateUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const document = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                slug: req.body.slug,
                email: req.body.email,
                phone: req.body.phone,
                profilePic: req.body.profilePic,
                role: req.body.role,
                active: req.body.active,
            },
            { new: true }
        );
        if (!document) {
            //res.status(404).json({msg:`there is no brand for this id ${id}`})
            return next(
                new ApiError(
                    `there is no document for this id ${req.params.id}`,
                    404
                )
            );
        } else {
            res.status(200).json({ data: document });
        }
    }
);

// @desc    Change password specific users by id
// @route   PUT /api/v1/users/:id/password
// @access  Private
export const changePassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const document = await User.findByIdAndUpdate(
            req.params.id,
            {
                password: hash_password(req.body.password),
                passwordChangedAt: Date.now(),
            },
            { new: true }
        );
        if (!document) {
            //res.status(404).json({msg:`there is no brand for this id ${id}`})
            return next(
                new ApiError(
                    `there is no document for this id ${req.params.id}`,
                    404
                )
            );
        } else {
            res.status(200).json({ data: document });
        }
    }
);

// @desc    Delete specific users by id
// @route   DELETE /api/v1/users/:id
// @access  Private
export const deleteUser = deleteOne(User);

// @desc    Delete all users
// @route   DELETE /api/v1/users
// @access  Private
export const deleteUsers = asyncHandler(async (req: Request, res: Response) => {
    await User.deleteMany({});
    res.status(204).send();
});

// @desc  Inactivate specific user by id
// @route   PATCH /api/v1/users/:id/inactivate
// @access  Private
export const inactivateUser = asyncHandler(
    async (req: Request, res: Response) => {
        await User.findByIdAndUpdate(req.params.id, { active: false });
        res.status(204).send();
    }
);

// @desc  activate specific user by id
// @route   PATCH /api/v1/users/:id/inactivate
// @access  Private
export const activateUser = asyncHandler(
    async (req: Request, res: Response) => {
        await User.findByIdAndUpdate(req.params.id, { active: true });
        res.status(204).send();
    }
);

// @desc    Get logged users
// @route   Get /api/v1/users/getMe
// @access  Private/Protect
export const getLoggedUserData = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.body.user._id) {
            return next(
                new ApiError(`there is no user for this id logged in`, 400)
            );
        } else {
            req.params.id = req.body.user._id;
            next();
        }
    }
);

// @desc    Update logged users Password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private/Protect
export const updateLoggedUserPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        //1) update user password based on the payload (req.body.user._id)
        const user = await User.findByIdAndUpdate(
            req.body.user._id,
            {
                password: hash_password(req.body.password),
                passwordChangedAt: Date.now(),
            },
            { new: true }
        );

        //2) Generate the token and send it to the user
        if (!user) {
            //res.status(404).json({msg:`there is no brand for this id ${id}`})
            return next(
                new ApiError(
                    `there is no user for this id ${req.body.user._id}`,
                    404
                )
            );
        } else {
            const token = createToken(user._id);
            res.status(200).json({ data: user, token });
        }
    }
);

// @desc    Update logged user data without password and role
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
export const updateLoggedUserData = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        //1) update user data based on the payload (req.body.user._id)
        const user = await User.findByIdAndUpdate(
            req.body.user._id,
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                profilePic: req.body.profilePic,
            },
            { new: true }
        );

        //2) Generate the token and send it to the user
        if (!user) {
            //res.status(404).json({msg:`there is no brand for this id ${id}`})
            return next(
                new ApiError(
                    `there is no user for this id ${req.body.user._id}`,
                    404
                )
            );
        } else {
            //const token = createToken(user._id);
            res.status(200).json({ data: user });
        }
    }
);

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteme
// @access  Private
export const deleteLoggedUserData = asyncHandler(
    async (req: Request, res: Response) => {
        await User.findByIdAndUpdate(req.body.user._id, { active: false });
        res.status(204).json({status:'success'});
    }
);