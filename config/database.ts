import mongoose from 'mongoose';
import dotenv from 'dotenv';

//initialize the environment variables the .env can not be used without it
dotenv.config({ path: 'config.env' });
const {DB_URI,} = process.env

export const dbConnection = ()=>{
    mongoose
    .connect(`${DB_URI}`)
    .then((conn) => {
        console.log(
            `Database Connected on host : ${conn.connection.host} on port ${conn.connection.port}`
        );
    })
    // .catch((err: string) => {
    //     console.log(`Data base Error : ${err}`);
    //     process.exit(1);
    // });
};
