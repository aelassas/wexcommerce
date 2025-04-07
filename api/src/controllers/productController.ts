import mongoose, { Expression } from 'mongoose'
import fs from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'
import { Request, Response } from 'express'
import escapeStringRegexp from 'escape-string-regexp'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../common/logger'
import * as env from '../config/env.config'
import i18n from '../lang/i18n'
import * as helper from '../common/helper'
import Product from '../models/Product'
import OrderItem from '../models/OrderItem'
import Cart from '../models/Cart'
import CartItem from '../models/CartItem'
import User from '../models/User'
import Order from '../models/Order'
import Wishlist from '../models/Wishlist'

/**
 * Upload product image.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error('[product.uploadImage] req.file not found')
    }

    const filename = `${nanoid()}_${Date.now()}${path.extname(req.file.originalname)}`
    const filepath = path.join(env.CDN_TEMP_PRODUCTS, filename)

    await fs.writeFile(filepath, req.file.buffer)
    res.json(filename)
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete temp product image.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteTempImage = async (req: Request, res: Response) => {
  try {
    const _image = path.join(env.CDN_TEMP_PRODUCTS, req.params.fileName)

    if (!(await helper.exists(_image))) {
      throw new Error(`[product.deleteTempImage] temp image ${_image} not found`)
    }

    await fs.unlink(_image)

    res.sendStatus(200)
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete product image.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { product: productId, image: imageFileName } = req.params
    if (!helper.isValidObjectId(productId)) {
      throw new Error('Product Id not valid')
    }
    const product = await Product.findById(productId)

    if (product) {
      const index = product.images!.findIndex((i) => i === imageFileName)

      if (index > -1) {
        const _image = path.join(env.CDN_PRODUCTS, imageFileName)
        if (await helper.exists(_image)) {
          await fs.unlink(_image)
        }
        product.images!.splice(index, 1)
        await product.save()
        res.sendStatus(200)
        return
      }
    }

    res.sendStatus(204)
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Create product.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const create = async (req: Request, res: Response) => {
  let product
  try {
    const {
      name,
      description,
      categories,
      image: imageFile,
      price,
      quantity,
      soldOut,
      hidden,
      images,
      featured,
    }: wexcommerceTypes.CreateProductPayload = req.body
    const __product = { name, description, categories, price, quantity, soldOut, hidden, featured, images: [] }

    product = new Product(__product)
    await product.save()

    // image
    if (imageFile) {
      const _image = path.join(env.CDN_TEMP_PRODUCTS, imageFile)
      if (await helper.exists(_image)) {
        const filename = `${product._id}_${Date.now()}${path.extname(imageFile)}`
        const newPath = path.join(env.CDN_PRODUCTS, filename)

        await fs.rename(_image, newPath)
        product.image = filename
      } else {
        await product.deleteOne()
        throw new Error('Image file not found')
      }
    } else {
      await product.deleteOne()
      throw new Error('Image field is required')
    }

    // images
    for (let i = 0; i < images.length; i += 1) {
      const image = images[i]
      const __image = path.join(env.CDN_TEMP_PRODUCTS, image)

      if (await helper.exists(__image)) {
        const filename = `${product._id}_${nanoid()}_${Date.now()}_${i}${path.extname(image)}`
        const newPath = path.join(env.CDN_PRODUCTS, filename)

        await fs.rename(__image, newPath)
        product.images!.push(filename)
      } else {
        await product.deleteOne()
        throw new Error('Image file not found')
      }
    }

    await product.save()
    res.status(200).json(product)
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update product image.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req: Request, res: Response) => {
  try {
    const {
      _id,
      categories,
      name,
      description,
      image,
      price,
      quantity,
      soldOut,
      hidden,
      images,
      tempImages,
      featured,
    }: wexcommerceTypes.UpdateProductPayload = req.body
    const product = await Product.findById(_id)

    if (product) {
      product.name = name
      product.description = description
      product.categories = categories.map((id) => new mongoose.Types.ObjectId(id))
      product.price = price
      product.quantity = quantity
      product.soldOut = soldOut
      product.hidden = hidden
      product.featured = featured

      // if (quantity > 0) {
      //   product.soldOut = false
      // }

      if (image) {
        const tempImagePath = path.join(env.CDN_TEMP_PRODUCTS, image)

        if (!(await helper.exists(tempImagePath))) {
          throw new Error(`${image} not found`)
        }

        const oldImage = path.join(env.CDN_PRODUCTS, product.image!)
        if (await helper.exists(oldImage)) {
          await fs.unlink(oldImage)
        }

        const filename = `${product._id}_${Date.now()}${path.extname(image)}`
        const filepath = path.join(env.CDN_PRODUCTS, filename)

        await fs.rename(tempImagePath, filepath)
        product.image = filename
      }

      // delete deleted images
      const _images: string[] = []
      if (images.length === 0) {
        for (const img of product.images) {
          const _image = path.join(env.CDN_PRODUCTS, img)
          if (await helper.exists(_image)) {
            await fs.unlink(_image)
          }
        }
      } else {
        for (const img of product.images) {
          if (!images.includes(img)) {
            const _image = path.join(env.CDN_PRODUCTS, img)
            if (await helper.exists(_image)) {
              await fs.unlink(_image)
            }
          } else {
            _images.push(img)
          }
        }
      }
      product.images = _images

      // add temp images
      for (let i = 0; i < tempImages.length; i += 1) {
        const imageFile = tempImages[i]
        const _image = path.join(env.CDN_TEMP_PRODUCTS, imageFile)

        if (await helper.exists(_image)) {
          const filename = `${product._id}_${nanoid()}_${Date.now()}_${i}${path.extname(imageFile)}`
          const newPath = path.join(env.CDN_PRODUCTS, filename)

          await fs.rename(_image, newPath)
          product.images.push(filename)
        }
      }

      await product.save()
      res.status(200).json(product)
      return
    }

    throw new Error(`Product ${_id} not found`)
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Check if a product is related to an order.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const checkProduct = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    if (!helper.isValidObjectId(id)) {
      throw new Error('Product id not valid')
    }

    const count = await OrderItem.find({ product: id }).limit(1).countDocuments()

    if (count === 1) {
      res.sendStatus(200)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[product.checkProduct] ${i18n.t('DB_ERROR')} ${id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete a product.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Product id not valid')
    }

    const product = await Product.findByIdAndDelete(id)

    if (product) {
      if (product.image) {
        const _image = path.join(env.CDN_PRODUCTS, product.image)

        if (await helper.exists(_image)) {
          await fs.unlink(_image)
        }
      }

      for (const image of product.images) {
        const _image = path.join(env.CDN_PRODUCTS, image)

        if (await helper.exists(_image)) {
          await fs.unlink(_image)
        }
      }

      await CartItem.deleteMany({ product: product.id })

      const orderItems = await OrderItem.find({ product: product.id })
      for (const orderItem of orderItems) {
        const order = await Order.findOne({ orderItems: orderItem.id })
        if (order) {
          await order.deleteOne()
        }
      }
      await OrderItem.deleteMany({ product: product.id })

      res.sendStatus(200)
      return
    }

    res.sendStatus(204)
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get a product.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id, language } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Product id not valid')
    }

    if (language.length !== 2) {
      throw new Error('Language not valid')
    }

    const _id = new mongoose.Types.ObjectId(id)

    const body: wexcommerceTypes.GetProductPayload = req.body || {}
    const { cart: cartId, wishlist: wisthlistId } = body
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
    if (wisthlistId) {
      const _wishlist = await Wishlist
        .findById(wisthlistId)
        .lean()

      if (_wishlist) {
        wishlistProducts = _wishlist.products
      }
    }

    const data = await Product.aggregate([
      {
        $match: {
          $expr: { $eq: ['$_id', _id] },
        },
      },
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
            { $project: { value: 0, values: 0 } },
          ],
          as: 'categories',
        },
      },
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
    ])

    if (data.length > 0) {
      res.json(data[0])
      return
    }

    res.sendStatus(204)
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get backend products.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getBackendProducts = async (req: Request, res: Response) => {
  try {
    const { body }: { body: wexcommerceTypes.GetBackendProductsPayload } = req
    const { user: userId } = req.params

    if (!helper.isValidObjectId(userId)) {
      throw new Error('User id not valid')
    }

    const user = await User.findOne({ _id: userId, type: wexcommerceTypes.UserType.Admin })

    if (!user) {
      throw new Error('Admin user not found')
    }

    const page = parseInt(req.params.page, 10)
    const size = parseInt(req.params.size, 10)
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    let category
    if (req.params.category) {
      category = new mongoose.Types.ObjectId(req.params.category)
    }

    let $match: mongoose.FilterQuery<env.Product>
    if (category) {
      $match = {
        $and: [
          {
            categories: category,
          },
          {
            name: { $regex: keyword, $options: options },
          },
        ],
      }
    } else {
      $match = {
        name: { $regex: keyword, $options: options },
      }
    }

    let $sort: Record<string, 1 | -1 | Expression.Meta> = { createdAt: -1 } // createdAt desc
    const { sortBy } = body
    if (sortBy) {
      if (sortBy === wexcommerceTypes.SortProductBy.priceAsc) {
        $sort = { price: 1, createdAt: -1 }
      } else if (sortBy === wexcommerceTypes.SortProductBy.priceDesc) {
        $sort = { price: -1, createdAt: -1 }
      } else if (sortBy === wexcommerceTypes.SortProductBy.featured) {
        $sort = { featured: -1, createdAt: -1 }
      } else {
        $sort = { createdAt: -1 }
      }
    }

    const products = await Product.aggregate([
      {
        $match,
      },
      {
        $project: {
          categories: 0,
          description: 0,
        },
      },
      {
        $facet: {
          resultData: [
            { $sort },
            { $skip: ((page - 1) * size) },
            { $limit: size },
          ],
          pageInfo: [
            {
              $count: 'totalRecords',
            },
          ],
        },
      },
    ], { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } })

    res.json(products)
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get frontend products.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getFrontendProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.params.page, 10)
    const size = parseInt(req.params.size, 10)
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    let category
    if (req.params.category) {
      category = new mongoose.Types.ObjectId(req.params.category)
    }

    const { body }: { body: wexcommerceTypes.GetProductsPayload } = req
    const { cart: cartId } = body
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

    const { wishlist: wishlistId } = body
    let wishlistProducts: mongoose.Types.ObjectId[] = []
    if (wishlistId) {
      const _wishlist = await Wishlist
        .findById(wishlistId)
        .lean()

      if (_wishlist) {
        wishlistProducts = _wishlist.products
      }
    }

    let $match: mongoose.FilterQuery<env.Product>
    if (category) {
      $match = {
        $and: [
          {
            categories: category,
          },
          {
            name: { $regex: keyword, $options: options },
          },
          {
            hidden: false,
          },
        ],
      }
    } else {
      $match = {
        $and: [
          {
            name: { $regex: keyword, $options: options },
          },
          {
            hidden: false,
          },
        ],
      }
    }

    let $sort: Record<string, 1 | -1 | Expression.Meta> = { createdAt: -1 } // createdAt desc
    const { sortBy } = body
    if (sortBy) {
      if (sortBy === wexcommerceTypes.SortProductBy.priceAsc) {
        $sort = { price: 1, createdAt: -1 }
      } else if (sortBy === wexcommerceTypes.SortProductBy.priceDesc) {
        $sort = { price: -1, createdAt: -1 }
      } else if (sortBy === wexcommerceTypes.SortProductBy.featured) {
        $sort = { featured: -1, createdAt: -1 }
      } else {
        $sort = { createdAt: -1 }
      }
    }

    const products = await Product.aggregate([
      {
        $match,
      },
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
      {
        $project: {
          categories: 0,
          description: 0,
        },
      },
      {
        $facet: {
          resultData: [
            { $sort },
            { $skip: ((page - 1) * size) },
            { $limit: size },
          ],
          pageInfo: [
            {
              $count: 'totalRecords',
            },
          ],
        },
      },
    ], { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } })

    res.json(products)
  } catch (err) {
    logger.error(i18n.t('DB_ERROR'), err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get featured products.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const { body }: { body: wexcommerceTypes.GetProductsPayload } = req
    const { cart: cartId, size: _size } = body

    const size: number = _size || 10

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

    const { wishlist: wishlistId } = body
    let wishlistProducts: mongoose.Types.ObjectId[] = []
    if (wishlistId) {
      const _wishlist = await Wishlist
        .findById(wishlistId)
        .lean()

      if (_wishlist) {
        wishlistProducts = _wishlist.products
      }
    }

    const products = await Product.aggregate([
      {
        $match: { featured: true, soldOut: false, hidden: false, quantity: { $gt: 0 } },
      },
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
      {
        $project: {
          categories: 0,
          description: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: size,
      },
    ], { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } })

    res.json(products)
  } catch (err) {
    logger.error(`[product.getFeaturedProducts] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
