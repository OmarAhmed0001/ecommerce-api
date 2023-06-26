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
import express from 'express';
import ApiError from '../utils/apiError';

const handleJwtInvalidSignature=()=>new ApiError('Invalid token, please login again...',401);
const handleJwtExpired=()=>new ApiError('Expired token, please login again...',401);

const globalError= (err: express.ErrorRequestHandler|any, req: express.Request, res: express.Response, next: Function) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV==='development') {
        sendErrorForDev(err,res);
    }else {
      if(err.name==='JsonWebTokenError') err= handleJwtInvalidSignature();
      if(err.name==='TokenExpiredError') err= handleJwtExpired();
        sendErrorForProd(err,res);
    }
    
  }

  const sendErrorForDev=(err: express.ErrorRequestHandler|any,res:express.Response)=>{
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
      });
  }

  const sendErrorForProd=(err: express.ErrorRequestHandler|any,res:express.Response)=>{
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
  }

  export=globalError;