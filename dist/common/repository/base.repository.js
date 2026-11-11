"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options }) {
        return await this.model.create(data, options);
    }
    async createOne({ data, options = {} }) {
        const [doc] = await this.create({ data: [data], options });
        return doc;
    }
    async find({ filter, projection, select, options }) {
        const doc = this.model.find(filter, projection);
        if (select)
            doc.select(select);
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.skip)
            doc.skip(options.skip);
        if (options?.limit)
            doc.limit(options.limit);
        if (options?.sort)
            doc.sort(options.sort);
        if (options?.lean)
            doc.lean(options.lean);
        return await doc.exec();
    }
    async countDocuments({ filter, }) {
        return await this.model.countDocuments(filter).exec();
    }
    async paginate({ filter, select, options, page = 1, limit = 5 }) {
        const skip = (page - 1) * limit;
        const count = await this.countDocuments({});
        const pages = Math.ceil(count / limit);
        const docs = await this.find({
            filter,
            options: {
                ...options,
                skip,
                limit,
            },
            select
        });
        return { count, pages, page, limit, docs };
    }
    async findOne({ filter, projection, select, options }) {
        const doc = this.model.findOne(filter, projection);
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.lean)
            doc.lean(options.lean);
        if (select)
            doc.select(select);
        return await doc.exec();
    }
    async findById({ id, select, projection, options }) {
        const doc = this.model.findById(id, projection);
        if (select)
            doc.select(select);
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.lean)
            doc.lean(options.lean);
        return await doc.exec();
    }
    async exists({ filter = {} }) {
        return await this.model.exists(filter);
    }
    async findByIdAndUpdate({ id, update, options }) {
        return await this.model.findByIdAndUpdate(id, {
            ...update,
            $inc: {
                ...(update.$inc || {}),
                versionData: 1
            }
        }, {
            returnDocument: "after",
            runValidators: true,
            ...options
        }).exec();
    }
    async findOneAndUpdate({ filter, update, options }) {
        return await this.model.findOneAndUpdate(filter, {
            ...update,
            $inc: {
                ...(update.$inc || {}),
                versionData: 1
            }
        }, {
            returnDocument: "after",
            runValidators: true,
            ...options
        }).exec();
    }
    async updateOne({ filter, update, options }) {
        const updateData = Array.isArray(update)
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
            };
        return await this.model.updateOne(filter, updateData, {
            runValidators: true,
            ...options
        }).exec();
    }
    async updateMany({ filter, update, options }) {
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
            };
        return await this.model.updateMany(filter, updateData, {
            runValidators: true,
            ...options
        }).exec();
    }
    async findOneAndReplace({ filter, update, options }) {
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
            };
        return await this.model.findOneAndReplace(filter, updateData, {
            returnDocument: "after",
            runValidators: true,
            ...options
        }).exec();
    }
    async findByIdAndDelete({ id, options = {} }) {
        return await this.model.findByIdAndDelete(id, {
            returnDocument: "after",
            ...options
        }).exec();
    }
    async findOneAndDelete({ filter = {}, options }) {
        return await this.model.findOneAndDelete(filter, {
            returnDocument: "after",
            ...options
        }).exec();
    }
    async deleteOne({ filter, options }) {
        return await this.model.deleteOne(filter, {
            ...options
        }).exec();
    }
    async deleteMany({ filter, options }) {
        return await this.model.deleteMany(filter, {
            ...options
        }).exec();
    }
    async aggregate({ pipeline, options }) {
        const query = this.model.aggregate(pipeline);
        if (Object.keys(options).length > 0) {
            query.option(options);
        }
        return await query.exec();
    }
}
exports.DatabaseRepository = DatabaseRepository;
