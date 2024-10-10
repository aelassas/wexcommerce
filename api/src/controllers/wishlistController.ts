import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../common/logger'
import i18n from '../lang/i18n'
import Wishlist from '../models/Wishlist'

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
    const { wishlistId } = body

    let wishlist
    if (wishlistId) {
      wishlist = await Wishlist.findById(wishlistId)
    }

    //
    // Try to get user's wishlist, otherwise create a new one
    //
    if (!wishlist) {
      const { userId } = body

      if (userId) {
        const _wishlist = await Wishlist.findOne({ user: userId })

        if (_wishlist) {
          await Wishlist.deleteOne({ _id: _wishlist._id })
        }

        wishlist = new Wishlist({ user: userId })
      } else {
        wishlist = new Wishlist()
      }

      await wishlist.save()
    }

    const { productId } = body
    wishlist.products.push(new mongoose.Types.ObjectId(productId))
    await wishlist.save()

    return res.status(200).json(wishlist._id)
  } catch (err) {
    logger.error(`[wishlist.create] ${i18n.t('DB_ERROR')} ${req.body}`, err)
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

    const wishlist = await Wishlist
      .findById(id)
      .populate<{ products: wexcommerceTypes.Product[] }>('products')
      .lean()

    if (wishlist) {
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

    const wishlist = await Wishlist
      .findById(id)

    if (wishlist) {
      return res.json(wishlist?.products.length)
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

    const wishlist = await Wishlist.findOne({ user })

    if (wishlist) {
      return res.json(wishlist.id)
    }

    return res.json(null)
  } catch (err) {
    logger.error(`[wishlist.getWishlistId] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
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
