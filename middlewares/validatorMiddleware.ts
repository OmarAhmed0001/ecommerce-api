// Copyright 2023 oa147
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//import ApiError from '../utils/apiError';
import express from 'express';
import { validationResult } from 'express-validator';
 // @desc Finds the validation errors in this request and wraps them in an object with handy functions
    // @param req - The request object
    // @param res - The response object
    // @param next - The next middleware function in the stack
    // @returns {Object} - Returns an object with the mapped errors
    // @example const errors = validationResult(req);               
const validatorMiddleware = (req: express.Request, res: express.Response,next:Function) => {
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export default validatorMiddleware;




