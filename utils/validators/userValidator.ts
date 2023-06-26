import { body, check } from 'express-validator';
import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });
import validatorMiddleware from '../../middlewares/validatorMiddleware';
import slugify from 'slugify';
import bcrypt from 'bcrypt';
import User from '../../models/userModel';
import { RequestHandler } from 'express';

export const getUserValidator = [
    check('id').isMongoId().withMessage('invalid User id'),
    validatorMiddleware,
];

export const createUserValidator: RequestHandler[] = [
    check('name')
        .notEmpty()
        .withMessage('User required')
        .isLength({ min: 2 })
        .withMessage('Too short name')
        .custom((value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email')
        .custom((value) =>
            User.findOne({ email: value }).then((user) => {
                if (user) {
                    return Promise.reject('E-mail already in use');
                }
            })
        ),
    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Too short password')
        .custom((password, { req }) => {
            if (password !== req.body.confirmPassword) {
                throw new Error(
                    'Password confirmation does not match password'
                );
            }
            return true;
        }),
    check('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password required'),
    check('profilePic').optional(),
    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])
        .withMessage('Invalid phone')
        .isLength({ min: 10 })
        .withMessage('Too short phone'),
    check('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Invalid role'),
    validatorMiddleware,
];

export const updateUserValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid User id'),
    body('name')
        .optional()
        .custom((value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email')
        .custom((value) =>
            User.findOne({ email: value }).then((user) => {
                if (user) {
                    return Promise.reject('E-mail already in use');
                }
            })
        ),
    check('profilePic').optional(),
    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])
        .withMessage('Invalid phone')
        .isLength({ min: 10 })
        .withMessage('Too short phone'),
    check('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Invalid role'),
    validatorMiddleware,
];
export const changeUserPasswordValidator: RequestHandler[] = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current Password required')
        .custom(async (password: string, { req }) => {
            // 1) verify current password
            const user = await User.findById(req.params?.id);
            if (!user) {
                throw new Error('there is no user for this id');
            }
            const isCorrectPassword = await bcrypt.compare(
                req.body.currentPassword + process.env.BCRYPT_PASSWORD,
                user.password
            );
            if (!isCorrectPassword) {
                throw new Error('Current password is wrong');
            }
            return true;
        }),
    body('confirmPassword').notEmpty().withMessage('Confirm password required'),
    body('password')
        .notEmpty()
        .withMessage('New Password required')
        .isLength({ min: 6 })
        .withMessage('Too short password')
        .custom(async (password: string, { req }) => {
            //2) verify new password !== current password
            if (password !== req.body.confirmPassword) {
                throw new Error(
                    'Password confirmation does not match password'
                );
            }
            return true;
        }),
    validatorMiddleware,
];

export const deleteUserValidator: RequestHandler[] = [
    check('id').isMongoId().withMessage('invalid User id'),
    validatorMiddleware,
];

export const updateLoggedUserValidator: RequestHandler[] = [
    body('name')
        .optional()
        .custom((value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email')
        .custom((value) =>
            User.findOne({ email: value }).then((user) => {
                if (user) {
                    return Promise.reject('E-mail already in use');
                }
            })
        ),
    check('profilePic').optional(),
    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])
        .withMessage('Invalid phone')
        .isLength({ min: 10 })
        .withMessage('Too short phone'),
    validatorMiddleware,
];
