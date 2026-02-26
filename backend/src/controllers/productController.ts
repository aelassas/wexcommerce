import mongoose, { Expression } from 'mongoose'
import asyncFs from 'node:fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'
import { Request, Response } from 'express'
import escapeStringRegexp from 'escape-string-regexp'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../utils/logger'
import * as env from '../config/env.config'
import i18n from '../lang/i18n'
import * as helper from '../utils/helper'
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

    // security check: restrict allowed extensions
    const ext = path.extname(filename)
    if (!env.allowedImageExtensions.includes(ext.toLowerCase())) {
      res.status(400).send('Invalid product image file type')
      return
    }

    await asyncFs.writeFile(filepath, req.file.buffer)
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
  const { fileName: image } = req.params
  try {
    // prevent null bytes
    if (image.includes('\0')) {
      res.status(400).send('Invalid filename')
      return
    }

    const baseDir = path.resolve(env.CDN_TEMP_PRODUCTS)
    const targetPath = path.resolve(baseDir, image as string)

    // critical security check: prevent directory traversal
    if (!targetPath.startsWith(baseDir + path.sep)) {
      logger.warn(`Directory traversal attempt: ${image}`)
      res.status(403).send('Forbidden')
      return
    }

    if (await helper.pathExists(targetPath)) {
      await asyncFs.unlink(targetPath)
    } else {
      throw new Error(`[product.deleteTempImage] temp image ${image} not found`)
    }

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
    if (!helper.isValidObjectId(productId as string)) {
      throw new Error('Product Id not valid')
    }
    const product = await Product.findById(productId)

    if (product) {
      const index = product.images!.findIndex((i) => i === imageFileName)

      if (index > -1) {
        const _image = path.join(env.CDN_PRODUCTS, imageFileName as string)
        if (await helper.pathExists(_image)) {
          await asyncFs.unlink(_image)
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

    const tempDir = path.resolve(env.CDN_TEMP_PRODUCTS)
    const productsDir = path.resolve(env.CDN_PRODUCTS)

    // Ensure `product.images` exists
    product.images = product.images || []

    // 1. MAIN IMAGE
    if (!imageFile) {
      await product.deleteOne()
      throw new Error('Image field is required')
    }

    const safeImage = path.basename(imageFile)
    if (safeImage !== imageFile) {
      await product.deleteOne()
      throw new Error('Invalid image filename')
    }

    const tempImagePath = path.resolve(tempDir, safeImage)
    if (!tempImagePath.startsWith(tempDir + path.sep) || !(await helper.pathExists(tempImagePath))) {
      await product.deleteOne()
      throw new Error('Image file not found')
    }

    const ext = path.extname(safeImage).toLowerCase()
    if (!env.allowedImageExtensions.includes(ext)) {
      await product.deleteOne()
      throw new Error('Invalid image type')
    }

    const mainFilename = `${product._id}_${Date.now()}${ext}`
    const mainDestPath = path.resolve(productsDir, mainFilename)
    if (!mainDestPath.startsWith(productsDir + path.sep)) {
      await product.deleteOne()
      throw new Error('Invalid destination path')
    }

    await asyncFs.rename(tempImagePath, mainDestPath)
    product.image = mainFilename

    // 2. ADDITIONAL IMAGES
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i += 1) {
        const img = images[i]
        if (!img) {
          continue
        }

        const safeImg = path.basename(img)
        if (safeImg !== img) {
          await product.deleteOne()
          throw new Error('Invalid image filename')
        }

        const tempImgPath = path.resolve(tempDir, safeImg)
        if (!tempImgPath.startsWith(tempDir + path.sep) || !(await helper.pathExists(tempImgPath))) {
          await product.deleteOne()
          throw new Error('Image file not found')
        }

        const imgExt = path.extname(safeImg).toLowerCase()
        if (!env.allowedImageExtensions.includes(imgExt)) {
          await product.deleteOne()
          throw new Error('Invalid image type')
        }

        const filename = `${product._id}_${nanoid()}_${Date.now()}_${i}${imgExt}`
        const destPath = path.resolve(productsDir, filename)
        if (!destPath.startsWith(productsDir + path.sep)) {
          await product.deleteOne()
          throw new Error('Invalid destination path')
        }

        await asyncFs.rename(tempImgPath, destPath)
        product.images.push(filename)
      }
    }

    // 3. SAVE PRODUCT
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

      const tempDir = path.resolve(env.CDN_TEMP_PRODUCTS)
      const productsDir = path.resolve(env.CDN_PRODUCTS)

      // Ensure product.images exists
      product.images = product.images || []

      // 1. UPDATE MAIN IMAGE
      if (image) {
        const safeImage = path.basename(image)
        if (safeImage !== image) {
          throw new Error('Invalid image filename')
        }

        const tempImagePath = path.resolve(tempDir, safeImage)
        if (!tempImagePath.startsWith(tempDir + path.sep) || !(await helper.pathExists(tempImagePath))) {
          throw new Error(`${safeImage} not found`)
        }

        // Delete old image
        if (product.image) {
          const oldImagePath = path.resolve(productsDir, path.basename(product.image))
          if (oldImagePath.startsWith(productsDir + path.sep) && await helper.pathExists(oldImagePath)) {
            await asyncFs.unlink(oldImagePath)
          }
        }

        const ext = path.extname(safeImage).toLowerCase()
        if (!env.allowedImageExtensions.includes(ext)) {
          throw new Error('Invalid image type')
        }

        const filename = `${product._id}_${Date.now()}${ext}`
        const destPath = path.resolve(productsDir, filename)
        if (!destPath.startsWith(productsDir + path.sep)) {
          throw new Error('Invalid destination path')
        }

        await asyncFs.rename(tempImagePath, destPath)
        product.image = filename
      }

      // 2. DELETE REMOVED IMAGES
      const updatedImages: string[] = []

      if (images && Array.isArray(images)) {
        if (images.length === 0) {
          // Delete all existing images
          for (const img of product.images) {
            const oldPath = path.resolve(productsDir, path.basename(img))
            if (oldPath.startsWith(productsDir + path.sep) && await helper.pathExists(oldPath)) {
              await asyncFs.unlink(oldPath)
            }
          }
        } else {
          for (const img of product.images) {
            if (!images.includes(img)) {
              const oldPath = path.resolve(productsDir, path.basename(img))
              if (oldPath.startsWith(productsDir + path.sep) && await helper.pathExists(oldPath)) {
                await asyncFs.unlink(oldPath)
              }
            } else {
              updatedImages.push(img)
            }
          }
        }
      }
      product.images = updatedImages

      // 3. ADD NEW TEMP IMAGES
      if (tempImages && Array.isArray(tempImages)) {
        for (let i = 0; i < tempImages.length; i += 1) {
          const imageFile = tempImages[i]
          if (!imageFile) {
            continue
          }

          const safeImg = path.basename(imageFile)
          if (safeImg !== imageFile) {
            throw new Error('Invalid image filename')
          }

          const tempImgPath = path.resolve(tempDir, safeImg)
          if (!tempImgPath.startsWith(tempDir + path.sep)) {
            throw new Error(`Directory traversal attempt: ${safeImg}`)
          }

          const ext = path.extname(safeImg).toLowerCase()
          if (!env.allowedImageExtensions.includes(ext)) {
            throw new Error('Invalid image type')
          }

          const filename = `${product._id}_${nanoid()}_${Date.now()}_${i}${ext}`
          const destPath = path.resolve(productsDir, filename)
          if (!destPath.startsWith(productsDir + path.sep)) {
            throw new Error('Invalid destination path')
          }

          if ((await helper.pathExists(tempImgPath))) {
            await asyncFs.rename(tempImgPath, destPath)
            product.images.push(filename)
          }
        }
      }

      // 4. SAVE PRODUCT
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
    if (!helper.isValidObjectId(id as string)) {
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

    if (!helper.isValidObjectId(id as string)) {
      throw new Error('Product id not valid')
    }

    const product = await Product.findByIdAndDelete(id)

    if (product) {
      if (product.image) {
        const _image = path.join(env.CDN_PRODUCTS, product.image)

        if (await helper.pathExists(_image)) {
          await asyncFs.unlink(_image)
        }
      }

      for (const image of product.images) {
        const _image = path.join(env.CDN_PRODUCTS, image)

        if (await helper.pathExists(_image)) {
          await asyncFs.unlink(_image)
        }
      }

      await CartItem.deleteMany({ product: product._id.toString() })

      const orderItems = await OrderItem.find({ product: product._id.toString() })
      for (const orderItem of orderItems) {
        const order = await Order.findOne({ orderItems: orderItem._id.toString() })
        if (order) {
          await order.deleteOne()
        }
      }
      await OrderItem.deleteMany({ product: product._id.toString() })

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

    if (!helper.isValidObjectId(id as string)) {
      throw new Error('Product id not valid')
    }

    if (language.length !== 2) {
      throw new Error('Language not valid')
    }

    const _id = new mongoose.Types.ObjectId(id as string)

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
 * Get admin products.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const { body }: { body: wexcommerceTypes.GetAdminProductsPayload } = req
    const { user: userId } = req.params

    if (!helper.isValidObjectId(userId as string)) {
      throw new Error('User id not valid')
    }

    const user = await User.findOne({ _id: userId, type: wexcommerceTypes.UserType.Admin })

    if (!user) {
      throw new Error('Admin user not found')
    }

    const page = parseInt(req.params.page as string, 10)
    const size = parseInt(req.params.size as string, 10)
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    let category
    if (req.params.category) {
      category = new mongoose.Types.ObjectId(req.params.category as string)
    }

    let $match: mongoose.QueryFilter<env.Product>
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
    const page = parseInt(req.params.page as string, 10)
    const size = parseInt(req.params.size as string, 10)
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    let category
    if (req.params.category) {
      category = new mongoose.Types.ObjectId(req.params.category as string)
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

    let $match: mongoose.QueryFilter<env.Product>
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
