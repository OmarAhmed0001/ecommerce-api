class ApiFeatures {
    mongooseQuery: any;
    queryString: any;
    paginationResult: any;

    constructor(mongooseQuery: any, queryString: any) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }
    filter() {
        const query = { ...this.queryString };
        const removeFields = ['sort', 'limit', 'page', 'fields'];
        removeFields.forEach((el) => delete query[el]);
        let queryString = JSON.stringify(query);
        queryString = queryString.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );
        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryString));
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = `${this.queryString.sort}`.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.sort(sortBy);
        } else {
            this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = `${this.queryString.fields}`.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.select(fields);
        } else {
            this.mongooseQuery = this.mongooseQuery.select('-__v');
        }
        return this;
    }
    paginate(countDocuments: number) {
        const page = +`${this.queryString.page}` || 1;
        const limit = +`${this.queryString.limit}` || 10;
        const skip = (page - 1) * limit;
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;
        // result of pagination
        const pagination: any = {};
        pagination.currentPage = page;
        pagination.limit = limit;
        pagination.numberOfPages = Math.ceil(countDocuments / limit);
        // next page
        if (skip + limit < countDocuments) {
            pagination.nextPage = page + 1;
        }
        // previous page
        if (skip > 0) {
            pagination.previousPage = page - 1;
        }

        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
        this.paginationResult = pagination;
        return this;
    }
    search(modelName?: string) {
        if (this.queryString.search) {
            let query: any = {};
            if (modelName === 'Product') {
                query['$or'] = [
                    {
                        title: {
                            $regex: `\\b${this.queryString.search}\\b`,
                            $options: 'i',
                        },
                    },
                    {
                        description: {
                            $regex: `\\b${this.queryString.search}\\b`,
                            $options: 'i',
                        },
                    },
                ];
            } else {
                query['$or'] = [
                    {
                        name: {
                            $regex: `\\b${this.queryString.search}\\b`,
                            $options: 'i',
                        },
                    },
                ];
            }
            this.mongooseQuery = this.mongooseQuery.find(query);
        }
        return this;
    }
}

export default ApiFeatures;
