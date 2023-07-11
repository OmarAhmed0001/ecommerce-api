// core modules
import path from 'path';
// third party modules
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
// modules from this project
// Database
import { dbConnection } from '../config/database';
// Routes
import CategoryRoute from '../routes/categoryRoute';
import SubCategoryRoute from '../routes/subCategoryRoute';
import BrandRoute from '../routes/brandRoute';
import ProductRoute from '../routes/productRoute';
import UserRoute from '../routes/userRoute';
import AuthRoute from '../routes/authRoute';
import ReviewRoute from '../routes/reviewRoute';
import WishlistRoute from '../routes/wishlistRoute';
// Error Handling
import ApiError from '../utils/apiError';
import globalError from '../middlewares/errorMiddleware';

dotenv.config({ path: 'config.env' });

// Connect With db
dbConnection();

// Express app
const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../uploads')));

// app.use(bodyParser.urlencoded({ extended: true }));

// Development logging

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(`mode : ${process.env.NODE_ENV}`);
}
// Mount Routs
app.use('/api/v1/categories', CategoryRoute);
app.use('/api/v1/subcategories', SubCategoryRoute);
app.use('/api/v1/brands', BrandRoute);
app.use('/api/v1/products', ProductRoute);
app.use('/api/v1/users', UserRoute);
app.use('/api/v1/auth', AuthRoute);
app.use('/api/v1/reviews', ReviewRoute);
app.use('/api/v1/wishlist', WishlistRoute);

app.all('*', (req: express.Request, res: express.Response, next: Function) => {
    // create error and send it to error handling
    // const err=new Error(`can't find this route ${req.originalUrl}`);
    // next(err.message);

    next(new ApiError(`can't find this route ${req.originalUrl}`, 400));
});

// Global error handling middleware
app.use(globalError);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`);
});

// Handled Rejection Outside Express
process.on('unhandledRejection', (err: Error) => {
    console.error(`unhandledRejection Errors: ${err.name} | ${err.message}`);
    server.close(() => {
        console.log(`Shutting down.....`);

        process.exit(1);
    });
});
