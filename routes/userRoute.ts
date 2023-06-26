import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resizeUserImage,
    uploadUserImage,
    changePassword,
    getLoggedUserData,
    updateLoggedUserPassword,
    updateLoggedUserData,
    deleteLoggedUserData,
} from '../controllers/UserController';
import {
    createUserValidator,
    deleteUserValidator,
    getUserValidator,
    updateUserValidator,
    changeUserPasswordValidator,
    updateLoggedUserValidator,
} from '../utils/validators/userValidator';
import { protect, allowedTo } from '../controllers/AuthController';

const router = express.Router();
router.use(protect);
router.route('/getMe').get(getLoggedUserData, getUser);
router.route('/changeMyPassword').put(updateLoggedUserPassword);
router.route('/updateMe').put(updateLoggedUserValidator, updateLoggedUserData);
router.route('/deleteMe').delete(deleteLoggedUserData);
router
    .route('/changePassword/:id')
    .put(allowedTo('admin'), changeUserPasswordValidator, changePassword);
router
    .route('/')
    .get(allowedTo('admin', 'manager'), getUsers)
    .post(
        allowedTo('admin'),
        uploadUserImage,
        resizeUserImage,
        createUserValidator,
        createUser
    );
router
    .route('/:id')
    .get(allowedTo('admin', 'manager'), getUserValidator, getUser)
    .put(
        allowedTo('admin'),
        uploadUserImage,
        resizeUserImage,
        updateUserValidator,
        updateUser
    )
    .delete(allowedTo('admin'), deleteUserValidator, deleteUser);
export default router;
