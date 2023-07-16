import express from 'express';
import {
    addAddress,
    removeAddress,
    getLoggedUserAddresses,
} from '../controllers/AddressesController';

import { protect, allowedTo } from '../controllers/AuthController';

const router = express.Router();
router.use(protect, allowedTo('user'));

router.route('/').post(addAddress).get(getLoggedUserAddresses);
router.route('/:addressId').delete(removeAddress);
export default router;
