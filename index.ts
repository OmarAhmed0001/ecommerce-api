// core modules
import path from 'path';
// third party modules
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
// modules from this project
// Database
import { dbConnection } from './config/database';
// Routes
import mountRoutes from './routes/index';
// Error Handling
import ApiError from './utils/apiError';
import globalError from './middlewares/errorMiddleware';
import { webhookCheckout } from './controllers/OrderController';

dotenv.config({ path: 'config.env' });

// Connect With db
dbConnection();

// Express app
const app = express();

// checkout webhooks
app.post(
    '/webhook-checkout',
    express.raw({ type: 'application/json' }),
    webhookCheckout
);

// Enable cors
app.use(cors());
app.options('*', cors());

// Compress all routes
app.use(compression());

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
mountRoutes(app);

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
