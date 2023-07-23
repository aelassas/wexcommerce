import strings from '../config/app.config.js'
import Env from '../config/env.config.js'
import Category from '../models/Category.js'
import Value from '../models/Value.js'
import Product from '../models/Product.js'
import mongoose from 'mongoose'
import escapeStringRegexp from 'escape-string-regexp'

export const validate = async (req, res) => {
    const language = req.body.language
    const keyword = escapeStringRegexp(req.body.value)
    const options = 'i'

    const categories = await Category.aggregate([
        {
            $lookup: {
                from: 'Value',
                let: { values: '$values' },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { $expr: { $in: ['$_id', '$$values'] } },
                                { $expr: { $eq: ['$language', language] } },
                                { $expr: { $regexMatch: { input: '$value', regex: `^${keyword}$`, options } } }
                            ]
                        }
                    }
                ],
                as: 'value'
            }
        },
        { $unwind: { path: '$value', preserveNullAndEmptyArrays: false } },
        {
            $count: 'count'
        }
    ])

    if (categories.length > 0 && categories[0].count > 0) {
        return res.sendStatus(204)
    }

    return res.sendStatus(200)
}

export const checkCategory = (req, res) => {
    const id = new mongoose.Types.ObjectId(req.params.id)

    Product.find({ categories: id })
        .limit(1)
        .count()
        .then(count => {
            if (count === 1) {
                return res.sendStatus(200)
            }
            return res.sendStatus(204)
        })
        .catch((err) => {
            console.error(`[category.checkCategory]  ${strings.DB_ERROR} ${id}`, err)
            return res.status(400).send(strings.DB_ERROR + err)
        })
}

export const create = async (req, res) => {
    const values = req.body

    try {
        const _values = []
        for (let i = 0; i < values.length; i++) {
            const value = values[i]
            const _value = new Value({
                language: value.language,
                value: value.value
            })
            await _value.save()
            _values.push(_value._id)
        }

        const category = new Category({ values: _values })
        await category.save()
        return res.sendStatus(200)
    } catch (err) {
        console.error(`[category.create]  ${strings.DB_ERROR} ${req.body}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const update = (req, res) => {
    Category.findById(req.params.id)
        .populate('values')
        .then(async category => {
            if (category) {
                const values = req.body
                for (let i = 0; i < values.length; i++) {
                    const value = values[i]
                    const categoryValue = category.values.filter(v => v.language === value.language)[0]
                    if (categoryValue) {
                        categoryValue.value = value.value
                        await categoryValue.save()
                    } else {
                        const _value = new Value({
                            language: _value.language,
                            value: _value.value
                        })
                        await _value.save()
                        category.values.push(_value._id)
                        await category.save()
                    }
                }
                return res.sendStatus(200)
            } else {
                console.error('[category.update] Category not found:', req.body)
                return res.sendStatus(204)
            }
        })
        .catch((err) => {
            console.error(`[category.update]  ${strings.DB_ERROR} ${req.body}`, err)
            return res.status(400).send(strings.DB_ERROR + err)
        })
}

export const deleteCategory = async (req, res) => {
    const id = req.params.id
    try {
        const category = await Category.findByIdAndDelete(id)
        if (category) {
            await Value.deleteMany({ _id: { $in: category.values } })
            return res.sendStatus(200)
        } else {
            return res.sendStatus(204)
        }
    } catch (err) {
        console.error(`[category.delete]  ${strings.DB_ERROR} ${id}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const getCategory = async (req, res) => {
    Category.findById(req.params.id)
        .populate('values')
        .lean()
        .then(category => {
            if (category) {
                category.name = category.values.filter(value => value.language === req.params.language)[0].value
                return res.json(category)
            } else {
                console.error('[category.getCategory] Category not found:', req.params.id)
                return res.sendStatus(204)
            }
        })
        .catch((err) => {
            console.error(`[category.getCategory]  ${strings.DB_ERROR} ${req.params.id}`, err)
            return res.status(400).send(strings.DB_ERROR + err)
        })
}

export const getCategories = async (req, res) => {
    try {
        const language = req.params.language

        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'Value',
                    let: { values: '$values' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $in: ['$_id', '$$values'] } },
                                    { $expr: { $eq: ['$language', language] } }
                                ]
                            }
                        }
                    ],
                    as: 'value'
                }
            },
            { $unwind: { path: '$value', preserveNullAndEmptyArrays: false } },
            { $addFields: { name: '$value.value' } },
            { $project: { value: 0, values: 0 } },
            { $sort: { name: 1 } },
        ], { collation: { locale: Env.DEFAULT_LANGUAGE, strength: 2 } })

        return res.json(categories)
    } catch (err) {
        console.error(`[category.getCategories]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const searchCategories = async (req, res) => {
    try {
        const language = req.params.language
        const keyword = escapeStringRegexp(req.query.s || '')
        const options = 'i'

        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'Value',
                    let: { values: '$values' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $in: ['$_id', '$$values'] } },
                                    { $expr: { $eq: ['$language', language] } },
                                    { $expr: { $regexMatch: { input: '$value', regex: keyword, options } } }
                                ]
                            }
                        }
                    ],
                    as: 'value'
                }
            },
            { $unwind: { path: '$value', preserveNullAndEmptyArrays: false } },
            { $addFields: { name: '$value.value' } },
            { $project: { value: 0, values: 0 } },
            { $sort: { name: 1 } },
        ], { collation: { locale: Env.DEFAULT_LANGUAGE, strength: 2 } })

        return res.json(categories)
    } catch (err) {
        console.error(`[category.getCategories]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}
