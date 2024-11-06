import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../common/logger'
import i18n from '../lang/i18n'
import * as helper from '../common/helper'
import Wishlist from '../models/Wishlist'
import User from '../models/User'

/**
 * Add item to wishlist.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const addItem = async (req: Request, res: Response) => {
  try {
    const { body }: { body: wexcommerceTypes.AddWishlistItemPayload } = req
    const { userId, productId } = body

    if (!helper.isValidObjectId(userId)) {
      throw new Error('User Id not valid')
    }

    if (!helper.isValidObjectId(productId)) {
      throw new Error('Product Id not valid')
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new Error(`User ${userId} not found`)
    }

    let wishlist = await Wishlist.findOne({ user: userId })
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] })
    }
    wishlist.products.push(new mongoose.Types.ObjectId(productId))
    await wishlist.save()

    return res.status(200).json(wishlist._id)
  } catch (err) {
    logger.error(`[wishlist.addItem] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete wishlist item.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { wishlist: wishlistId, product: productId } = req.params

    if (!helper.isValidObjectId(wishlistId)) {
      throw new Error('Wishlist Id not valid')
    }

    if (!helper.isValidObjectId(productId)) {
      throw new Error('Product Id not valid')
    }

    const wishlist = await Wishlist.findById(wishlistId)

    if (wishlist) {
      await wishlist.updateOne({ $pull: { products: new mongoose.Types.ObjectId(productId) } })
      return res.sendStatus(200)
    }
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[wishlist.deleteItem] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get wishlist.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Wishlist Id not valid')
    }

    const wishlist = await Wishlist
      .findById(id)
      .populate<{ products: wexcommerceTypes.Product[] }>('products')
      .lean()

    if (wishlist) {
      for (const product of wishlist.products) {
        product.inWishlist = true
      }
      return res.json(wishlist)
    }
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[wishlist.getWishlist] ${i18n.t('DB_ERROR')} ${req.params.id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get number of wishlist items in a wishlist.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getWishlistCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Wishlist Id not valid')
    }

    const wishlist = await Wishlist.findById(id)

    if (wishlist) {
      return res.json(wishlist.products.length)
    }

    return res.json(0)
  } catch (err) {
    logger.error(`[wishlist.getWishlistCount] ${i18n.t('DB_ERROR')} ${req.params.id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get user's wishlist ID.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getWishlistId = async (req: Request, res: Response) => {
  try {
    const { user } = req.params

    if (!helper.isValidObjectId(user)) {
      throw new Error('User Id not valid')
    }

    const wishlist = await Wishlist.findOne({ user })

    if (wishlist) {
      return res.json(wishlist.id)
    }

    return res.json(null)
  } catch (err) {
    logger.error(`[wishlist.getWishlistId] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).json(null)
  }
}

/**
 * Clear wishlist.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Wishlist Id not valid')
    }

    const wishlist = await Wishlist.findById(id)

    if (wishlist) {
      wishlist.products = []
      await wishlist.save()
      return res.sendStatus(200)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[wishlist.getWishlistId] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update wishlist.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id, user } = req.params

    const wishlist = await Wishlist.findById(id)

    if (wishlist) {
      wishlist.user = new mongoose.Types.ObjectId(user)
      await wishlist.save()

      return res.sendStatus(200)
    }
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[cart.update] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Check wishlist.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const check = async (req: Request, res: Response) => {
  try {
    const { id, user } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Wishlist Id not valid')
    }

    if (!helper.isValidObjectId(user)) {
      throw new Error('User Id not valid')
    }

    const wishlist = await Wishlist.findOne({ user, _id: id })

    if (wishlist) {
      return res.sendStatus(200)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[cart.update] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
