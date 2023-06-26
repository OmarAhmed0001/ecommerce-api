import express from 'express';
import {
    signup,
    login,
    uploadSignupImage,
    resizeSignupImage,
    forgotPassword,
    verifyPasswordResetCode,
    resetPassword,
} from '../controllers/AuthController';
import {
    signupValidator,
    loginValidator,
} from '../utils/validators/authValidator';

const router = express.Router();

router
    .route('/signup')
    .post(uploadSignupImage, resizeSignupImage, signupValidator, signup);
router.route('/login').post(loginValidator, login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/verifyResetCode').post(verifyPasswordResetCode);
router.route('/resetPassword').put(resetPassword);

// router
//     .route('/:id')
//     .get(getUserValidator, getUser)
//     .put(
//         uploadCategoryImage,
//         resizeCategoryImage,
//         updateUserValidator,
//         updateUser
//     )
//     .delete(deleteUserValidator, deleteUser);
export default router;
