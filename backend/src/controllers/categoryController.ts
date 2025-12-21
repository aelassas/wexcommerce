import mongoose from 'mongoose'
import path from 'node:path'
import asyncFs from 'node:fs/promises'
import { nanoid } from 'nanoid'
import escapeStringRegexp from 'escape-string-regexp'
import { Request, Response } from 'express'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../utils/logger'
import * as helper from '../utils/helper'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import Category from '../models/Category'
import Value from '../models/Value'
import Product from '../models/Product'
import Cart from '../models/Cart'
import Wishlist from '../models/Wishlist'

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

    if (!language || !value) {
      throw new Error('Missing language or value from payload')
    }

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
      res.sendStatus(204)
      return
    }

    res.sendStatus(200)
  } catch (err) {
    logger.error(`[category.validate] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Check if a category contains a product.
 *
 * @param {Request} req
 * @param {Response} res
 */
export const checkCategory = async (req: Request, res: Response) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id)

    const count = await Product.find({ categories: id })
      .limit(1)
      .countDocuments()

    if (count === 1) {
      res.sendStatus(200)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.checkCategory] ${i18n.t('DB_ERROR')} ${req.params.id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
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

      if (!(await helper.pathExists(_image))) {
        logger.error(i18n.t('CATEGORY_IMAGE_NOT_FOUND'), body)
        res.status(400).send(i18n.t('CATEGORY_IMAGE_NOT_FOUND'))
        return
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

      if (await helper.pathExists(_image)) {
        const filename = `${category._id}_${Date.now()}${path.extname(image)}`
        const newPath = path.join(env.CDN_CATEGORIES, filename)

        await asyncFs.rename(_image, newPath)
        category.image = filename
        await category.save()
      }
    }

    res.status(200).send(category)
  } catch (err) {
    logger.error(`[category.create] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
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
      res.sendStatus(204)
      return
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
        category.values.push(_value)
        await category.save()
      }
    }
    res.status(200).send(category)
  } catch (err) {
    logger.error(`[category.update] ${i18n.t('DB_ERROR')} ${id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
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
    if (!helper.isValidObjectId(id)) {
      throw new Error('Id not valid')
    }
    const category = await Category.findByIdAndDelete(id)
    if (category) {
      await Value.deleteMany({ _id: { $in: category.values } })
      if (category.image) {
        const image = path.join(env.CDN_CATEGORIES, category.image)
        if (await helper.pathExists(image)) {
          await asyncFs.unlink(image)
        }
      }
      res.sendStatus(200)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.delete] ${i18n.t('DB_ERROR')} ${id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
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
    if (!helper.isValidObjectId(id)) {
      throw new Error('Id not valid')
    }
    if (language.length !== 2) {
      throw new Error('Language not valid')
    }
    const category = await Category.findById(id)
      .populate<{ values: env.Value[] }>('values')
      .lean()

    if (category) {
      const name = category.values.filter((value) => value.language === language)[0].value
      res.json({ _id: category._id, name, values: category.values, image: category.image, featured: category.featured })
      return
    }
    logger.error('[category.getCategory] Category not found:', id)
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.getCategory] ${i18n.t('DB_ERROR')} ${id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
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
    const { language, imageRequired } = req.params
    if (language.length !== 2) {
      throw new Error('Language not valid')
    }
    const _imageRequired = helper.StringToBoolean(imageRequired)

    let $match: mongoose.QueryFilter<env.Category> = {}
    if (_imageRequired) {
      $match = { image: { $ne: null } }
    }

    const categories = await Category.aggregate([
      {
        $match,
      },
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

    res.json(categories)
  } catch (err) {
    logger.error(`[category.getCategories] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get featured categories.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getFeaturedCategories = async (req: Request, res: Response) => {
  try {
    const { language, size: _size } = req.params
    if (language.length !== 2) {
      throw new Error('Language not valid')
    }
    const cartId = String(req.query.c || '')
    const wishlistId = String(req.query.w || '')
    const size = Number.parseInt(_size, 10)

    let cartProducts: mongoose.Types.ObjectId[] = []
    if (cartId) {
      const _cart = await Cart
        .findById(cartId)
        .populate<{ cartItems: env.CartItem[] }>('cartItems')
        .lean()

      if (_cart) {
        cartProducts = _cart.cartItems.map((cartItem) => cartItem.product)
      }
    }

    let wishlistProducts: mongoose.Types.ObjectId[] = []
    if (wishlistId) {
      const _wishlist = await Wishlist
        .findById(wishlistId)
        .lean()

      if (_wishlist) {
        wishlistProducts = _wishlist.products
      }
    }

    const data = await Product.aggregate([
      {
        $match: { soldOut: false, hidden: false, quantity: { $gt: 0 } },
      },
      //
      // Add inCart and inWishlist fields
      //
      {
        $addFields: {
          inCart: {
            $cond: [{ $in: ['$_id', cartProducts] }, 1, 0],
          },
          inWishlist: {
            $cond: [{ $in: ['$_id', wishlistProducts] }, 1, 0],
          },
        },
      },
      //
      // lookup categories
      //
      {
        $lookup: {
          from: 'Category',
          let: { categories: '$categories' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$categories'] },
              },
            },
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
          ],
          as: 'category',
        },
      },
      //
      // unwind category
      //
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: false } },
      //
      // Remove categories and description fields
      //
      {
        $project: {
          categories: 0,
          description: 0,
        },
      },
      //
      // Sort products by createdAt desc
      //
      {
        $sort: { createdAt: -1 },
      },
      //
      // Group products by category
      //
      {
        $group: {
          _id: '$category._id',
          name: { $first: '$category.name' },
          image: { $first: '$category.image' },
          featured: { $first: '$category.featured' },
          products: { $push: '$$ROOT' },
        },
      },
      //
      // Sort categories by name
      //
      {
        $sort: { name: 1 },
      },
      //
      // Build final result and take only (size) products
      //
      {
        $project: {
          _id: 0,
          category: {
            _id: '$_id',
            name: '$name',
            image: '$image',
            featured: '$featured',
          },
          products: { $slice: ['$products', size] },
        },
      },
    ])

    res.json(data)
  } catch (err) {
    logger.error(`[category.getFeaturedCategories] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
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
    if (language.length !== 2) {
      throw new Error('Language not valid')
    }
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

    res.json(categories)
  } catch (err) {
    logger.error(`[category.getCategories] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
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

    const filename = `${helper.getFilenameWithoutExtension(req.file.originalname)}_${nanoid()}_${Date.now()}${path.extname(req.file.originalname)}`
    const filepath = path.join(env.CDN_TEMP_CATEGORIES, filename)

    await asyncFs.writeFile(filepath, req.file.buffer)
    res.json(filename)
  } catch (err) {
    logger.error(`[category.createImage] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('ERROR') + err)
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
      throw new Error('[category.updateImage] req.file not found')
    }

    const { file } = req

    const category = await Category.findById(id)

    if (category) {
      if (category.image) {
        const image = path.join(env.CDN_CATEGORIES, category.image)
        if (await helper.pathExists(image)) {
          await asyncFs.unlink(image)
        }
      }

      const filename = `${category._id}_${Date.now()}${path.extname(file.originalname)}`
      const filepath = path.join(env.CDN_CATEGORIES, filename)

      await asyncFs.writeFile(filepath, file.buffer)
      category.image = filename
      await category.save()
      res.json(filename)
      return
    }

    logger.error('[category.updateImage] Category not found:', id)
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.updateImage] ${i18n.t('DB_ERROR')} ${id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
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
    if (!helper.isValidObjectId(id)) {
      throw new Error('Id not valid')
    }
    const category = await Category.findById(id)

    if (category) {
      if (category.image) {
        const image = path.join(env.CDN_CATEGORIES, category.image)
        if (await helper.pathExists(image)) {
          await asyncFs.unlink(image)
        }
      }
      category.image = undefined

      await category.save()
      res.sendStatus(200)
      return
    }
    logger.error('[category.deleteImage] Category not found:', id)
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[category.deleteImage] ${i18n.t('DB_ERROR')} ${id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
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
    if (!(await helper.pathExists(imageFile))) {
      throw new Error(`[category.deleteTempImage] temp image ${imageFile} not found`)
    }

    await asyncFs.unlink(imageFile)

    res.sendStatus(200)
  } catch (err) {
    logger.error(`[category.deleteTempImage] ${i18n.t('DB_ERROR')} ${image}`, err)
    res.status(400).send(i18n.t('ERROR') + err)
  }
}
