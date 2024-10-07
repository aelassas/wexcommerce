import mongoose from 'mongoose'
import path from 'node:path'
import fs from 'node:fs/promises'
import { v1 as uuid } from 'uuid'
import escapeStringRegexp from 'escape-string-regexp'
import { Request, Response } from 'express'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../common/logger'
import * as helper from '../common/helper'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import Category from '../models/Category'
import Value from '../models/Value'
import Product from '../models/Product'

/**
 * Validate category name by language.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const validate = async (req: Request, res: Response) => {
  try {
    const { language, value }: wexcommerceTypes.ValidateCategoryPayload = req.body
    const keyword = escapeStringRegexp(value)
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
                  { $expr: { $regexMatch: { input: '$value', regex: `^${keyword}$`, options } } },
                ],
              },
            },
          ],
          as: 'value',
        },
      },
      { $unwind: { path: '$value', preserveNullAndEmptyArrays: false } },
      {
        $count: 'count',
      },
    ])

    if (categories.length > 0 && categories[0].count > 0) {
      return res.sendStatus(204)
    }

    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[category.validate] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Check if a category contains a product.
 *
 * @param {Request} req
 * @param {Response} res
 */
export const checkCategory = async (req: Request, res: Response) => {
  const id = new mongoose.Types.ObjectId(req.params.id)

  try {
    const count = await Product.find({ categories: id })
      .limit(1)
      .countDocuments()

    if (count === 1) {
      return res.sendStatus(200)
    }
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.checkCategory] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Create a category.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const create = async (req: Request, res: Response) => {
  const { body }: { body: wexcommerceTypes.UpsertCategoryPayload } = req
  const { values, image, featured } = body

  try {
    if (image) {
      const _image = path.join(env.CDN_TEMP_CATEGORIES, image)

      if (!await helper.exists(_image)) {
        logger.error(i18n.t('CATEGORY_IMAGE_NOT_FOUND'), body)
        return res.status(400).send(i18n.t('CATEGORY_IMAGE_NOT_FOUND'))
      }
    }

    const _values = []
    for (const value of values) {
      const _value = new Value({
        language: value.language,
        value: value.value,
      })
      await _value.save()
      _values.push(_value._id)
    }

    const category = new Category({ values: _values, featured })
    await category.save()

    if (image) {
      const _image = path.join(env.CDN_TEMP_CATEGORIES, image)

      if (await helper.exists(_image)) {
        const filename = `${category._id}_${Date.now()}${path.extname(image)}`
        const newPath = path.join(env.CDN_CATEGORIES, filename)

        await fs.rename(_image, newPath)
        category.image = filename
        await category.save()
      }
    }

    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[category.create] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update a category.
 *
 * @param {Request} req
 * @param {Response} res
 */
export const update = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const category = await Category.findById(req.params.id).populate<{ values: env.Value[] }>('values')

    if (!category) {
      return res.sendStatus(204)
    }

    const { body }: { body: wexcommerceTypes.UpsertCategoryPayload } = req
    const { values, featured } = body
    category.featured = featured

    for (const value of values) {
      const categoryValue = category.values.filter((v) => v.language === value.language)[0]
      if (categoryValue) {
        categoryValue.value = value.value
        await categoryValue.save()
      } else {
        const _value = new Value({
          language: value.language,
          value: value.value,
        })
        await _value.save()
        category.values.push(_value.id)
        await category.save()
      }
    }
    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[category.update] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete a category.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const category = await Category.findByIdAndDelete(id)
    if (category) {
      await Value.deleteMany({ _id: { $in: category.values } })
      if (category.image) {
        const image = path.join(env.CDN_CATEGORIES, category.image)
        if (await helper.exists(image)) {
          await fs.unlink(image)
        }
      }
      return res.sendStatus(200)
    }
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.delete] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get a category.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {*}
 */
export const getCategory = async (req: Request, res: Response) => {
  const { id, language } = req.params
  try {
    const category = await Category.findById(id)
      .populate<{ values: env.Value[] }>('values')
      .lean()

    if (category) {
      const name = category.values.filter((value) => value.language === language)[0].value
      return res.json({ _id: category._id, name, values: category.values, image: category.image, featured: category.featured })
    }
    logger.error('[category.getCategory] Category not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.getCategory] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get categories.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { language } = req.params

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
                ],
              },
            },
          ],
          as: 'value',
        },
      },
      { $unwind: { path: '$value', preserveNullAndEmptyArrays: false } },
      { $addFields: { name: '$value.value' } },
      { $project: { value: 0, values: 0 } },
      { $sort: { name: 1 } },
    ], { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } })

    return res.json(categories)
  } catch (err) {
    logger.error(`[category.getCategories] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Search categories.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const searchCategories = async (req: Request, res: Response) => {
  try {
    const { language } = req.params
    const keyword = escapeStringRegexp(String(req.query.s || ''))
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
                  { $expr: { $regexMatch: { input: '$value', regex: keyword, options } } },
                ],
              },
            },
          ],
          as: 'value',
        },
      },
      { $unwind: { path: '$value', preserveNullAndEmptyArrays: false } },
      { $addFields: { name: '$value.value' } },
      { $project: { value: 0, values: 0 } },
      { $sort: { name: 1 } },
    ], { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } })

    return res.json(categories)
  } catch (err) {
    logger.error(`[category.getCategories] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Upload a Category image to temp folder.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const createImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error('[category.createImage] req.file not found')
    }

    const filename = `${helper.getFilenameWithoutExtension(req.file.originalname)}_${uuid()}_${Date.now()}${path.extname(req.file.originalname)}`
    const filepath = path.join(env.CDN_TEMP_CATEGORIES, filename)

    await fs.writeFile(filepath, req.file.buffer)
    return res.json(filename)
  } catch (err) {
    logger.error(`[category.createImage] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Update a Category image.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateImage = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (!req.file) {
      const msg = '[category.updateImage] req.file not found'
      logger.error(msg)
      return res.status(400).send(msg)
    }

    const { file } = req

    const category = await Category.findById(id)

    if (category) {
      if (category.image) {
        const image = path.join(env.CDN_CATEGORIES, category.image)
        if (await helper.exists(image)) {
          await fs.unlink(image)
        }
      }

      const filename = `${category._id}_${Date.now()}${path.extname(file.originalname)}`
      const filepath = path.join(env.CDN_CATEGORIES, filename)

      await fs.writeFile(filepath, file.buffer)
      category.image = filename
      await category.save()
      return res.json(filename)
    }

    logger.error('[category.updateImage] Category not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.updateImage] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete a Category image.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteImage = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const category = await Category.findById(id)

    if (category) {
      if (category.image) {
        const image = path.join(env.CDN_CATEGORIES, category.image)
        if (await helper.exists(image)) {
          await fs.unlink(image)
        }
      }
      category.image = undefined

      await category.save()
      return res.sendStatus(200)
    }
    logger.error('[category.deleteImage] Category not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.deleteImage] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete a temp Category image.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {*}
 */
export const deleteTempImage = async (req: Request, res: Response) => {
  const { image } = req.params

  try {
    const imageFile = path.join(env.CDN_TEMP_CATEGORIES, image)
    if (!await helper.exists(imageFile)) {
      throw new Error(`[category.deleteTempImage] temp image ${imageFile} not found`)
    }

    await fs.unlink(imageFile)

    res.sendStatus(200)
  } catch (err) {
    logger.error(`[category.deleteTempImage] ${i18n.t('DB_ERROR')} ${image}`, err)
    res.status(400).send(i18n.t('ERROR') + err)
  }
}
