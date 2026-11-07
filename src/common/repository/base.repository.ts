import mongoose, { AggregateOptions, AnyKeys, CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, MongooseBaseQueryOptions, MongooseUpdateQueryOptions, PipelineStage, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult } from 'mongoose';
import { IPaginate } from '../interface';
export abstract class DatabaseRepository<T> {
    constructor(protected model: Model<T>) { }

    async create({ data }: { data: AnyKeys<T>[] }): Promise<HydratedDocument<T>[]>;
    async create({ data, options }: { data: AnyKeys<T>[], options?: CreateOptions }):
        Promise<HydratedDocument<T>[]>;

    async create({ data, options }: { data: AnyKeys<T>[], options?: CreateOptions }):
        Promise<HydratedDocument<T>[]> {
        return await this.model.create(data as any, options)
    }
    async createOne({ data, options = {} }: { data: AnyKeys<T>, options?: CreateOptions }):
        Promise<HydratedDocument<T>> {
        const [doc] = await this.create({ data: [data], options })
        return doc as HydratedDocument<T>
    }

    async find({
        filter,
        projection,
        select,
        options
    }: {
        filter?: QueryFilter<T>,
        projection?: ProjectionType<T> | null | undefined,
        select?: string,
        options?: QueryOptions<T> | null | undefined
    }): Promise<HydratedDocument<T>[] | undefined | null> {
        const doc = this.model.find(filter, projection)
        if (select) doc.select(select)
        if (options?.populate) doc.populate(options.populate as PopulateOptions[])
        if (options?.skip) doc.skip(options.skip)
        if (options?.limit) doc.limit(options.limit)
        if (options?.sort) doc.sort(options.sort)
        if (options?.lean) doc.lean(options.lean)
        return await doc.exec()
    }

    async countDocuments({
        filter,
    }: {
        filter?: QueryFilter<T>
    }): Promise<number> {
        return await this.model.countDocuments(filter).exec()
    }

    async paginate({
        filter,
        select,
        options,
        page = 1,
        limit = 5
    }: {
        filter: QueryFilter<T>,
        select: string,
        options?: QueryOptions<T> | null | undefined,
        page?: number,
        limit?: number
    }): Promise<IPaginate<T>> {
        const skip = (page - 1) * limit
        const count = await this.countDocuments({})
        const pages = Math.ceil(count / limit)
        const data = await this.find({
            filter,
            options: {
                ...options,
                skip,
                limit,
            },
            select
        })
        return { count, pages, page, limit, data }
    }

    async findOne({ filter, projection, select, options }: {
        filter: QueryFilter<T>,
        projection?: ProjectionType<T> | null | undefined,
        select?: string,
        options?: QueryOptions<T> & { lean?: false } | null | undefined
    }): Promise<HydratedDocument<T> | undefined | null>;

    async findOne({ filter, projection, select, options }: {
        filter: QueryFilter<T>,
        projection?: ProjectionType<T> | null | undefined,
        select?: string,
        options?: QueryOptions<T> & { lean?: true } | null | undefined
    }): Promise<FlattenMaps<T> | undefined | null>;

    async findOne({
        filter,
        projection,
        select,
        options
    }: {
        filter: QueryFilter<T>,
        projection?: ProjectionType<T> | null | undefined,
        select?: string,
        options?: QueryOptions<T> | null | undefined
    }): Promise<HydratedDocument<T> | FlattenMaps<T> | undefined | null> {
        const doc = this.model.findOne(filter, projection)
        if (options?.populate) doc.populate(options.populate as PopulateOptions[])
        if (options?.lean) doc.lean(options.lean)
        if (select) doc.select(select)
        return await doc.exec()
    }

    async findById({ id, projection, select, options }: {
        id: mongoose.Types.ObjectId,
        projection?: ProjectionType<T> | null | undefined,
        select?: string,
        options?: QueryOptions<T> & { lean?: false } | null | undefined
    }): Promise<HydratedDocument<T> | undefined | null>;

    async findById({ id, projection, select, options }: {
        id: mongoose.Types.ObjectId,
        projection?: ProjectionType<T> | null | undefined,
        select?: string,
        options?: QueryOptions<T> & { lean?: true } | null | undefined
    }): Promise<FlattenMaps<T> | undefined | null>;

    async findById({
        id,
        select,
        projection,
        options
    }: {
        id: mongoose.Types.ObjectId,
        select?: string,
        projection?: ProjectionType<T> | null | undefined,
        options?: QueryOptions<T> | null | undefined
    }): Promise<HydratedDocument<T> | FlattenMaps<T> | undefined | null> {
        const doc = this.model.findById(id, projection)
        if (select) doc.select(select)
        if (options?.populate) doc.populate(options.populate as PopulateOptions[])
        if (options?.lean) doc.lean(options.lean)
        return await doc.exec()
    }

    async exists({
        filter = {}
    }: {
        filter: QueryFilter<T>
    }) {
        return await this.model.exists(filter)
    }

    async findByIdAndUpdate({
        id,
        update,
        options
    }: {
        id: mongoose.Types.ObjectId,
        update: UpdateQuery<T>,
        options?: QueryOptions<T>
    }): Promise<HydratedDocument<T> | FlattenMaps<T> | undefined | null> {
        return await this.model.findByIdAndUpdate(
            id,
            {
                ...update,
                $inc: {
                    ...(update.$inc || {}),
                    versionData: 1
                }
            },
            {
                returnDocument: "after",
                runValidators: true,
                ...options
            }
        ).exec()
    }

    async findOneAndUpdate({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
        options?: QueryOptions<T> | null
    }): Promise<HydratedDocument<T> | FlattenMaps<T> | undefined | null> {
        return await this.model.findOneAndUpdate(
            filter,
            {
                ...update,
                $inc: {
                    ...(update.$inc || {}),
                    versionData: 1
                }
            },
            {
                returnDocument: "after",
                runValidators: true,
                ...options
            }
        ).exec()
    }

    async updateOne({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<T>,
        update: UpdateQuery<T> | UpdateWithAggregationPipeline
        options?: MongooseUpdateQueryOptions<T>
    }): Promise<UpdateWriteOpResult> {
        const updateData: UpdateQuery<T> | UpdateWithAggregationPipeline = Array.isArray(update)
            ? [
                ...update,
                {
                    $set: {
                        versionData: {
                            $add: [{ $ifNull: ["$versionData", 0] }, 1]
                        }
                    }
                }
            ]
            : {
                ...update,
                $inc: {
                    ...(update.$inc || {}),
                    versionData: 1
                }
            }

        return await this.model.updateOne(
            filter,
            updateData,
            {
                runValidators: true,
                ...options
            }
        ).exec()
    }

    async updateMany({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<T>,
        update: UpdateQuery<T> | UpdateWithAggregationPipeline
        options?: MongooseUpdateQueryOptions<T>
    }): Promise<UpdateWriteOpResult> {
        const updateData = Array.isArray(update)
            ? [
                ...update,
                { $set: { versionData: { $add: ['$versionData', 1] } } }
            ]
            : {
                ...update,
                $inc: {
                    ...(update.$inc || {}),
                    versionData: 1
                }
            }
        return await this.model.updateMany(
            filter,
            updateData,
            {
                runValidators: true,
                ...options
            }
        ).exec()
    }

    async findOneAndReplace({
        filter,
        update,
        options
    }: {
        filter: QueryFilter<T>,
        update: UpdateQuery<T> | UpdateWithAggregationPipeline
        options?: MongooseUpdateQueryOptions<T>
    }): Promise<HydratedDocument<T> | null> {
        const updateData = Array.isArray(update)
            ? [
                ...update,
                { $set: { versionData: { $add: ['$versionData', 1] } } }
            ]
            : {
                ...update,
                $inc: {
                    ...(update.$inc || {}),
                    versionData: 1
                }
            }
        return await this.model.findOneAndReplace(
            filter,
            updateData,
            {
                returnDocument: "after",
                runValidators: true,
                ...options
            }
        ).exec()
    }

    async findByIdAndDelete({
        id,
        options = {}
    }: {
        id: mongoose.Types.ObjectId,
        options?: QueryOptions<T>
    }): Promise<HydratedDocument<T> | null> {
        return await this.model.findByIdAndDelete(
            id,
            {
                returnDocument: "after",
                ...options
            }
        ).exec()
    }

    async findOneAndDelete({
        filter = {},
        options
    }: {
        filter: QueryFilter<T>,
        options?: QueryOptions<T>
    }): Promise<HydratedDocument<T> | null> {
        return await this.model.findOneAndDelete(
            filter,
            {
                returnDocument: "after",
                ...options
            }
        ).exec()
    }

    async deleteOne({
        filter,
        options
    }: {
        filter: QueryFilter<T>,
        options?: MongooseBaseQueryOptions<T>
    }): Promise<DeleteResult> {
        return await this.model.deleteOne(
            filter,
            {
                ...options
            }
        ).exec()
    }

    async deleteMany({
        filter,
        options
    }: {
        filter: QueryFilter<T>,
        options?: MongooseBaseQueryOptions<T>
    }): Promise<DeleteResult> {
        return await this.model.deleteMany(
            filter,
            {
                ...options
            }
        ).exec()
    }

    async aggregate({
        pipeline,
        options
    }: {
        pipeline: PipelineStage[],
        options: AggregateOptions
    }): Promise<T[]> {
        const query = this.model.aggregate(pipeline)
        if (Object.keys(options).length > 0) {
            query.option(options)
        }
        return await query.exec()
    }
}