import mongoose from 'mongoose'
import { Request, Response } from 'express'
import validator from 'validator'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../utils/logger'
import * as env from '../config/env.config'
import i18n from '../lang/i18n'
import * as helper from '../utils/helper'
import Cart from '../models/Cart'
import CartItem from '../models/CartItem'

/**
 * Add item to cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const addItem = async (req: Request, res: Response) => {
  try {
    const { body }: { body: wexcommerceTypes.AddItemPayload } = req
    const { cartId, productId }: wexcommerceTypes.AddItemPayload = body

    if (!helper.isValidObjectId(productId)) {
      throw new Error('Product Id not valid')
    }

    let cart
    if (cartId) {
      cart = await Cart.findById(cartId)
    }

    //
    // Try to get user's cart, otherwise create a new one
    //
    if (!cart) {
      const { userId } = body

      if (userId) {
        const _cart = await Cart.findOne({ user: userId })

        if (_cart) {
          await CartItem.deleteMany({ _id: { $in: _cart.cartItems } })
          await Cart.deleteOne({ _id: _cart._id })
        }

        cart = new Cart({ user: userId })
      } else {
        cart = new Cart()
      }

      await cart.save()
    }

    const cartItem = new CartItem({ product: productId })
    await cartItem.save()
    cart.cartItems.push(cartItem.id)
    await cart.save()

    res.status(200).json(cart._id)
  } catch (err) {
    logger.error(`[cart.addItem] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update item in cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { cartItem: cartItemId, quantity } = req.params

    if (!validator.isNumeric(quantity)) {
      throw new Error('Quantity not valid')
    }

    const cartItem = await CartItem.findById(cartItemId)

    if (cartItem) {
      cartItem.quantity = Number(quantity)
      await cartItem.save()

      res.sendStatus(200)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[cart.updateItem] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete cart item.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { cart: cartId, product: productId } = req.params
    if (!helper.isValidObjectId(productId)) {
      throw new Error('Product id not valid')
    }
    const cart = await Cart
      .findById(cartId)
      .populate<{ cartItems: env.CartItem[] }>('cartItems')

    let cartDeleted = false
    let quantity = 0

    if (cart) {
      const cartItems = cart.cartItems.filter((ci) => ci.product.equals(productId))

      if (cartItems.length > 0) {
        const cartItem = cartItems[0]
        quantity += cartItem.quantity
        const result = await CartItem.deleteOne({ _id: cartItem._id })

        if (result.deletedCount === 1) {
          const _cartItems = cart.cartItems.filter((ci) => !ci.product.equals(productId))

          if (_cartItems.length === 0) {
            const _result = await Cart.deleteOne({ _id: cart._id })

            if (_result.deletedCount === 1) {
              cartDeleted = true
            }
          }

          res.status(200).json({ cartDeleted, quantity })
          return
        }
      }
    }

    res.sendStatus(204)
  } catch (err) {
    logger.error(`[cart.deleteItem] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteCart = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (!helper.isValidObjectId(id)) {
      throw new Error('Id not valid')
    }
    const cart = await Cart.findByIdAndDelete(id)
    if (cart) {
      await CartItem.deleteMany({ _id: { $in: cart.cartItems } })
      res.sendStatus(200)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[cart.deleteCart] ${i18n.t('DB_ERROR')} ${id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Id not valid')
    }

    const cart = await Cart
      .findById(id)
      .populate({
        path: 'cartItems',
        populate: {
          path: 'product',
          model: 'Product',
        },
      })
      .lean()

    if (cart) {
      res.json(cart)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[cart.getCart] ${i18n.t('DB_ERROR')} ${req.params.id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get number of cart items in a cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCartCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Id not valid')
    }

    const data = await Cart.aggregate([
      { $match: { _id: { $eq: new mongoose.Types.ObjectId(id) } } },
      {
        $lookup: {
          from: 'CartItem',
          let: { cartItems: '$cartItems' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$cartItems'] },
              },
            },
          ],
          as: 'cartItems',
        },
      },
      {
        $project: {
          _id: 0,
          cartCount: { $sum: '$cartItems.quantity' },
        },
      },
    ])

    if (data.length > 0) {
      res.json(data[0].cartCount)
      return
    }
    res.json(0)
  } catch (err) {
    logger.error(`[cart.getCartCount] ${i18n.t('DB_ERROR')} ${req.params.id}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get user's cart ID.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCartId = async (req: Request, res: Response) => {
  try {
    const { user } = req.params

    if (!helper.isValidObjectId(user)) {
      throw new Error('User id not valid')
    }

    const cart = await Cart.findOne({ user })

    if (cart) {
      res.json(cart._id)
      return
    }

    res.json(null)
  } catch (err) {
    logger.error(`[cart.getCartId] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).json(null)
  }
}

/**
 * Update cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id, user } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Cart id not valid')
    }

    if (!helper.isValidObjectId(user)) {
      throw new Error('User id not valid')
    }

    const cart = await Cart.findById(id)

    if (cart) {
      cart.user = new mongoose.Types.ObjectId(user)
      await cart.save()

      res.sendStatus(200)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[cart.update] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Check cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const check = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Cart id not valid')
    }

    const cart = await Cart.findById(id)

    if (cart) {
      res.sendStatus(200)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[cart.check] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Clear other carts.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const clearOtherCarts = async (req: Request, res: Response) => {
  try {
    const { id, user } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Cart id not valid')
    }

    if (!helper.isValidObjectId(user)) {
      throw new Error('User id not valid')
    }

    const cart = await Cart.findOne({ user, _id: id })

    if (cart) {
      const otherCarts = await Cart.find({ user, _id: { $ne: id } })

      for (const otherCart of otherCarts) {
        await CartItem.deleteMany({ _id: { $in: otherCart.cartItems } })
        await otherCart.deleteOne()
      }

      res.sendStatus(200)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    logger.error(`[cart.clearOtherCarts] ${i18n.t('DB_ERROR')}`, err)
    res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
