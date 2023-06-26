import express from 'express';
import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError';
import ApiFeatures from '../utils/apiFeatures';

export const deleteOne = (Model: any) =>
    asyncHandler(
        async (req: express.Request, res: express.Response, next: Function) => {
            const { id } = req.params;
            const document = await Model.findByIdAndDelete(id);
            if (!document) {
                //res.status(404).json({msg:`there is no document for this id ${id}`});
                return next(
                    new ApiError(`there is no document for this id ${id}`, 404)
                );
            } else {
                res.status(204).send();
            }
        }
    );

export const updateOne = (Model: any) =>
    asyncHandler(
        async (req: express.Request, res: express.Response, next: Function) => {
            const document = await Model.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!document) {
                //res.status(404).json({msg:`there is no brand for this id ${id}`})
                return next(
                    new ApiError(
                        `there is no document for this id ${req.params.id}`,
                        404
                    )
                );
            } else {
                res.status(200).json({ data: document });
            }
        }
    );

export const createOne = (Model: any) =>
    asyncHandler(async (req: express.Request, res: express.Response) => {
        const document = await Model.create(req.body);
        res.status(201).json({ data: document });
    });

export const getOne = (Model: any) =>
    asyncHandler(
        async (req: express.Request, res: express.Response, next: Function) => {
            const { id } = req.params;
            const document = await Model.findById(id);
            if (!document) {
                //res.status(404).json({msg:`there is no document for this id ${id}`})
                return next(
                    new ApiError(`there is no document for this id ${id}`, 404)
                );
            } else {
                res.status(200).json({ data: document });
            }
        }
    );
export const getAll = (Model: any, modelName: any = '') =>
    asyncHandler(async (req: express.Request, res: express.Response) => {
        let filterObj = {};
        if (req.body.filterObject) {
            filterObj = req.body.filterObject;
        }
        //  Build query
        const countDocuments = await Model.countDocuments();
        const features = new ApiFeatures(Model.find(filterObj), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate(countDocuments)
            .search(modelName);
        // Execute query
        const { mongooseQuery, paginationResult } = features;
        const documents = await mongooseQuery;
        res.status(200).json({
            results: documents.length,
            paginationResult,
            data: documents,
        });
    });
