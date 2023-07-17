import { Application } from 'express';
// Routes
import CategoryRoute from './categoryRoute';
import SubCategoryRoute from './subCategoryRoute';
import BrandRoute from './brandRoute';
import ProductRoute from './productRoute';
import UserRoute from './userRoute';
import AuthRoute from './authRoute';
import ReviewRoute from './reviewRoute';
import WishlistRoute from './wishlistRoute';
import AddressesRoute from './addressesRoute';
import CouponRoute from './couponRoute';
import CartRoute from './cartRoute';

export default (app: Application) => {
    // Mount Routs
    app.use('/api/v1/categories', CategoryRoute);
    app.use('/api/v1/subcategories', SubCategoryRoute);
    app.use('/api/v1/brands', BrandRoute);
    app.use('/api/v1/products', ProductRoute);
    app.use('/api/v1/users', UserRoute);
    app.use('/api/v1/auth', AuthRoute);
    app.use('/api/v1/reviews', ReviewRoute);
    app.use('/api/v1/wishlist', WishlistRoute);
    app.use('/api/v1/addresses', AddressesRoute);
    app.use('/api/v1/coupons', CouponRoute);
    app.use('/api/v1/cart', CartRoute);
};
