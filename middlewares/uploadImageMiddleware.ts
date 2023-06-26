import multer from "multer";
import ApiError from "../utils/apiError";
import { Request} from 'express';

const multerOptions = ()=>{
        // 1- Disk Storage Engine
// const multerStorage = multer.diskStorage({
//     destination: (
//         req: express.Request,
//         file: Express.Multer.File,
//         cb: Function
//     ) => {
//         cb(null, 'uploads/categories/');
//     },
//     filename: (
//         req: express.Request,
//         file: Express.Multer.File,
//         cb: Function
//     ) => {
//         const ext = file.mimetype.split('/')[1];
//         const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
//         cb(null, filename);
//     },
// });

    // 2- Memory Storage Engine
const multerStorage = multer.memoryStorage();

const multerFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: Function
) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new ApiError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
return upload;

}

export const uploadSingleImage = (fieldName:any)=>{

 return multerOptions().single(fieldName);
}


export const uploadMixOfImages = (ArrayOfFields:any)=>{
    return multerOptions().fields(ArrayOfFields);
}