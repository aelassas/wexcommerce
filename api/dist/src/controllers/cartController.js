import mongoose from 'mongoose';
import * as logger from "../common/logger.js";
import i18n from "../lang/i18n.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
/**
 * Add item to cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const addItem = async (req, res) => {
  try {
    const {
      cartId
    } = req.body;
    let cart;
    if (cartId) {
      cart = await Cart.findById(cartId);
    }
    //
    // Try to get user's cart, otherwise create a new one
    //
    if (!cart) {
      const {
        userId
      } = req.body;
      if (userId) {
        const _cart = await Cart.findOne({
          user: userId
        });
        if (_cart) {
          await CartItem.deleteMany({
            _id: {
              $in: _cart.cartItems
            }
          });
          await Cart.deleteOne({
            _id: _cart._id
          });
        }
        cart = new Cart({
          user: userId
        });
      } else {
        cart = new Cart();
      }
      await cart.save();
    }
    const {
      productId
    } = req.body;
    const cartItem = new CartItem({
      product: productId
    });
    await cartItem.save();
    cart.cartItems.push(cartItem.id);
    await cart.save();
    return res.status(200).json(cart._id);
  } catch (err) {
    logger.error(`[cart.create] ${i18n.t('DB_ERROR')} ${req.body}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Update item in cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateItem = async (req, res) => {
  try {
    const {
      cartItem: cartItemId,
      quantity
    } = req.params;
    const cartItem = await CartItem.findById(cartItemId);
    if (cartItem) {
      cartItem.quantity = Number(quantity);
      await cartItem.save();
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[cart.updateItem] ${i18n.t('DB_ERROR')} ${req.body}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Delete cart item.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteItem = async (req, res) => {
  try {
    const {
      cart: cartId,
      product: productId
    } = req.params;
    const cart = await Cart.findById(cartId).populate('cartItems');
    let cartDeleted = false;
    if (cart) {
      const cartItems = cart.cartItems.filter(ci => ci.product.equals(productId));
      if (cartItems.length > 0) {
        const cartItem = cartItems[0];
        const result = await CartItem.deleteOne({
          _id: cartItem._id
        });
        if (result.deletedCount === 1) {
          const _cartItems = cart.cartItems.filter(ci => !ci.product.equals(productId));
          if (_cartItems.length === 0) {
            const _result = await Cart.deleteOne({
              _id: cart._id
            });
            if (_result.deletedCount === 1) {
              cartDeleted = true;
            }
          }
          return res.status(200).json({
            cartDeleted
          });
        }
        return res.sendStatus(204);
      }
      return res.sendStatus(204);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[cart.deleteItem] ${i18n.t('DB_ERROR')} ${req.body}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Delete cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteCart = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const cart = await Cart.findByIdAndDelete(id);
    if (cart) {
      await CartItem.deleteMany({
        _id: {
          $in: cart.cartItems
        }
      });
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[cart.deleteCart] ${i18n.t('DB_ERROR')} ${id}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Get cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCart = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const cart = await Cart.findById(id).populate({
      path: 'cartItems',
      populate: {
        path: 'product',
        model: 'Product'
      }
    }).lean();
    if (cart) {
      return res.json(cart);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[cart.getCart] ${i18n.t('DB_ERROR')} ${req.params.id}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Get number of cart items in a cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCartCount = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const data = await Cart.aggregate([{
      $match: {
        _id: {
          $eq: new mongoose.Types.ObjectId(id)
        }
      }
    }, {
      $lookup: {
        from: 'CartItem',
        let: {
          cartItems: '$cartItems'
        },
        pipeline: [{
          $match: {
            $expr: {
              $in: ['$_id', '$$cartItems']
            }
          }
        }],
        as: 'cartItems'
      }
    }, {
      $project: {
        _id: 0,
        cartCount: {
          $sum: '$cartItems.quantity'
        }
      }
    }]);
    if (data.length > 0) {
      return res.json(data[0].cartCount);
    }
    return res.json(0);
  } catch (err) {
    logger.error(`[cart.getCartCount] ${i18n.t('DB_ERROR')} ${req.params.id}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Get user's cart ID.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCartId = async (req, res) => {
  try {
    const {
      user
    } = req.params;
    const cart = await Cart.findOne({
      user
    });
    if (cart) {
      return res.json(cart._id);
    }
    return res.json(null);
  } catch (err) {
    logger.error(`[cart.getCartId] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};
/**
 * Update cart.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req, res) => {
  try {
    const {
      id,
      user
    } = req.params;
    const cart = await Cart.findById(id);
    if (cart) {
      cart.user = new mongoose.Types.ObjectId(user);
      await cart.save();
      return res.sendStatus(200);
    }
    return res.sendStatus(204);
  } catch (err) {
    logger.error(`[cart.getCartId] ${i18n.t('DB_ERROR')}`, err);
    return res.status(400).send(i18n.t('DB_ERROR') + err);
  }
};