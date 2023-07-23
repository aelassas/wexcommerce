import mongoose from 'mongoose'
import strings from '../config/app.config.js'
import Cart from '../models/Cart.js'
import CartItem from '../models/CartItem.js'

export const addItem = async (req, res) => {
    try {
        const { cartId } = req.body

        let cart
        if (cartId) {
            cart = await Cart.findById(cartId)
        }

        if (!cart) {
            const { userId } = req.body

            if (userId) {
                const _cart = await Cart.find({ user: userId })

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

        const { productId } = req.body
        const cartItem = new CartItem({ product: productId })
        await cartItem.save()
        cart.cartItems.push(cartItem._id)
        await cart.save()

        return res.status(200).json(cart._id)
    } catch (err) {
        console.error(`[cart.create]  ${strings.DB_ERROR} ${req.body}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}
export const updateItem = async (req, res) => {
    try {
        const { cartItem: cartItemId, quantity } = req.params

        const cartItem = await CartItem.findById(cartItemId)

        if (cartItem) {
            cartItem.quantity = quantity
            await cartItem.save()

            return res.sendStatus(200)
        } else {
            return res.sendStatus(204)
        }
    } catch (err) {
        console.error(`[cart.updateItem]  ${strings.DB_ERROR} ${req.body}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const deleteItem = async (req, res) => {
    try {
        const { cart: cartId, product: productId } = req.params
        const cart = await Cart.findById(cartId).populate('cartItems')
        let cartDeleted = false

        if (cart) {
            const cartItems = cart.cartItems.filter(ci => ci.product.equals(productId))

            if (cartItems.length > 0) {
                const cartItem = cartItems[0]
                const result = await CartItem.deleteOne({ _id: cartItem._id })

                if (result.deletedCount === 1) {
                    const cartItems = cart.cartItems.filter(ci => !ci.product.equals(productId))

                    if (cartItems.length === 0) {
                        const result = await Cart.deleteOne({ _id: cart._id })

                        if (result.deletedCount === 1) {
                            cartDeleted = true
                        }
                    }

                    return res.status(200).json({ cartDeleted })
                } else {
                    return res.sendStatus(204)
                }
            } else {
                return res.sendStatus(204)
            }
        } else {
            return res.sendStatus(204)
        }

    } catch (err) {
        console.error(`[cart.deleteItem]  ${strings.DB_ERROR} ${req.body}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const deleteCart = async (req, res) => {
    const { id } = req.params

    try {
        const cart = await Cart.findByIdAndDelete(id)
        if (cart) {
            await CartItem.deleteMany({ _id: { $in: cart.cartItems } })
            return res.sendStatus(200)
        } else {
            return res.sendStatus(204)
        }
    } catch (err) {
        console.error(`[cart.deleteCart]  ${strings.DB_ERROR} ${id}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const getCart = async (req, res) => {
    try {
        const { id } = req.params

        const cart = await Cart
            .findById(id)
            .populate({
                path: 'cartItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                }
            })
            .lean()

        if (cart) {
            return res.json(cart)
        } else {
            return res.sendStatus(204)
        }
    } catch (err) {
        console.error(`[cart.getCart]  ${strings.DB_ERROR} ${req.params.id}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const getCartCount = async (req, res) => {
    try {
        const { id } = req.params

        const data = await Cart.aggregate([
            { $match: { _id: { $eq: new mongoose.Types.ObjectId(id) } } },
            {
                $lookup: {
                    from: 'CartItem',
                    let: { cartItems: '$cartItems' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$cartItems'] }
                            }
                        }
                    ],
                    as: 'cartItems'
                }
            },
            {
                $project: {
                    _id: 0,
                    cartCount: { $sum: '$cartItems.quantity' }
                }
            }
        ])

        if (data.length > 0) {
            return res.json(data[0].cartCount)
        }
        return res.json(0)

    } catch (err) {
        console.error(`[cart.getCartCount]  ${strings.DB_ERROR} ${req.params.id}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const getCartId = async (req, res) => {
    try {
        const { user } = req.params

        const cart = await Cart.findOne({ user })

        if (cart) {
            return res.json(cart._id)
        }

        return res.json(null)
    } catch (err) {
        console.error(`[cart.getCartId]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const update = async (req, res) => {
    try {
        const { id, user } = req.params

        const cart = await Cart.findById(id)

        if (cart) {
            cart.user = user
            await cart.save()

            return res.sendStatus(200)
        } else {
            return res.sendStatus(204)
        }
    } catch (err) {
        console.error(`[cart.getCartId]  ${strings.DB_ERROR}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}