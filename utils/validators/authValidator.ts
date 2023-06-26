import { check } from 'express-validator';
import slugify from 'slugify';
import User from '../../models/userModel';
import { RequestHandler } from 'express';
import validatorMiddleware from '../../middlewares/validatorMiddleware';

export const signupValidator: RequestHandler[] = [
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
    validatorMiddleware,
];

export const loginValidator: RequestHandler[] = [
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email'),
    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Too short password'),
    validatorMiddleware,
];
// export default UserValidator;
