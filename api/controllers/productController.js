import strings from '../config/app.config.js'
import Product from '../models/Product.js'
import OrderItem from '../models/OrderItem.js'
import Cart from '../models/Cart.js'
import CartItem from '../models/CartItem.js'
import User from '../models/User.js'
import mongoose from 'mongoose'
import Env from '../config/env.config.js'
import escapeStringRegexp from 'escape-string-regexp'
import fs from 'fs/promises'
import path from 'path'
import { v1 as uuid } from 'uuid'
import * as Helper from '../common/Helper.js'

const CDN_PRODUCTS = process.env.WC_CDN_PRODUCTS
const CDN_TEMP_PRODUCTS = process.env.WC_CDN_TEMP_PRODUCTS

export const uploadImage = async (req, res) => {
    try {
        if (!await Helper.exists(CDN_TEMP_PRODUCTS)) {
            await fs.mkdir(CDN_TEMP_PRODUCTS, { recursive: true })
        }

        const filename = `${uuid()}_${Date.now()}${path.extname(req.file.originalname)}`
        const filepath = path.join(CDN_TEMP_PRODUCTS, filename)

        await fs.writeFile(filepath, req.file.buffer)
        return res.json(filename)
    } catch (err) {
        console.error(strings.ERROR, err)
        return res.status(400).send(strings.ERROR + err)
    }
}

export const deleteTempImage = async (req, res) => {
    try {
        const _image = path.join(CDN_TEMP_PRODUCTS, req.params.fileName)
        if (await Helper.exists(_image)) {
            await fs.unlink(_image)
        }
        return res.sendStatus(200)
    } catch (err) {
        console.error(strings.ERROR, err)
        return res.status(400).send(strings.ERROR + err)
    }
}

export const deleteImage = async (req, res) => {
    try {
        const { product: productId, image: imageFileName } = req.params

        const product = await Product.findById(productId)

        if (product) {
            const index = product.images.findIndex(i => i === imageFileName)

            if (index > -1) {
                const _image = path.join(CDN_PRODUCTS, imageFileName)
                if (await Helper.exists(_image)) {
                    await fs.unlink(_image)
                }
                product.images.splice(index, 1)
                await product.save()
                return res.sendStatus(200)
            } else {
                return res.sendStatus(204)
            }

        } else {
            return res.sendStatus(204)
        }
    } catch (err) {
        console.error(strings.ERROR, err)
        return res.status(400).send(strings.ERROR + err)
    }
}

export const create = async (req, res) => {

    let product
    try {
        const { name, description, categories, image: imageFile, price, quantity, soldOut, hidden, images } = req.body
        const __product = { name, description, categories, price, quantity, soldOut, hidden }

        product = new Product(__product)
        await product.save()

        if (!await Helper.exists(CDN_PRODUCTS)) {
            await fs.mkdir(CDN_PRODUCTS, { recursive: true })
        }

        // image
        const _image = path.join(CDN_TEMP_PRODUCTS, imageFile)
        if (await Helper.exists(_image)) {
            const filename = `${product._id}_${Date.now()}${path.extname(imageFile)}`
            const newPath = path.join(CDN_PRODUCTS, filename)

            await fs.rename(_image, newPath)
            product.image = filename
        } else {
            await Product.deleteOne({ _id: product._id })
            const err = 'Image file not found'
            console.error(strings.ERROR, err)
            return res.status(400).send(strings.ERROR + err)
        }

        // images
        for (let i = 0; i < images.length; i++) {
            const imageFile = images[i]
            const _image = path.join(CDN_TEMP_PRODUCTS, imageFile)

            if (await Helper.exists(_image)) {
                const filename = `${product._id}_${uuid()}_${Date.now()}_${i}${path.extname(imageFile)}`
                const newPath = path.join(CDN_PRODUCTS, filename)

                await fs.rename(_image, newPath)
                product.images.push(filename)
            } else {
                await Product.deleteOne({ _id: product._id })
                const err = 'Image file not found'
                console.error(strings.ERROR, err)
                return res.status(400).send(strings.ERROR + err)
            }
        }

        await product.save()
        return res.status(200).json(product)
    } catch (err) {
        if (product && product._id) await Product.deleteOne({ _id: product._id })
        console.error(strings.ERROR, err)
        return res.status(400).send(strings.ERROR + err)
    }
}

export const update = async (req, res) => {
    try {
        const { _id, categories, name, description, image, price, quantity, soldOut, hidden, images, tempImages } = req.body
        const product = await Product.findById(_id)

        if (product) {
            product.name = name
            product.description = description
            product.categories = categories
            product.price = price
            product.quantity = quantity
            product.soldOut = soldOut
            product.hidden = hidden

            if (!await Helper.exists(CDN_PRODUCTS)) {
                await fs.mkdir(CDN_PRODUCTS, { recursive: true })
            }

            if (image) {
                const oldImage = path.join(CDN_PRODUCTS, product.image)
                if (await Helper.exists(oldImage)) {
                    await fs.unlink(oldImage)
                }

                const filename = `${product._id}_${Date.now()}${path.extname(image)}`
                const filepath = path.join(CDN_PRODUCTS, filename)

                const tempImagePath = path.join(CDN_TEMP_PRODUCTS, image)
                await fs.rename(tempImagePath, filepath)
                product.image = filename
            }

            // delete deleted images
            for (const image of product.images) {
                if (!images.includes(image)) {
                    const _image = path.join(CDN_PRODUCTS, image)
                    if (await Helper.exists(_image)) {
                        await fs.unlink(_image)
                    }
                    const index = product.images.indexOf(image)
                    product.images.splice(index, 1)
                }
            }

            // add temp images
            for (let i = 0; i < tempImages.length; i++) {
                const imageFile = tempImages[i]
                const _image = path.join(CDN_TEMP_PRODUCTS, imageFile)

                if (await Helper.exists(_image)) {
                    const filename = `${product._id}_${uuid()}_${Date.now()}_${i}${path.extname(imageFile)}`
                    const newPath = path.join(CDN_PRODUCTS, filename)

                    await fs.rename(_image, newPath)
                    product.images.push(filename)
                }
            }

            await product.save()
            return res.status(200).json(product)
        } else {
            const err = `Product ${_id} not found`
            console.error(strings.ERROR, err)
            return res.status(400).send(strings.ERROR + err)
        }
    } catch (err) {
        console.error(strings.ERROR, err)
        return res.status(400).send(strings.ERROR + err)
    }
}

export const checkProduct = async (req, res) => {
    try {
        const { id } = req.params

        const count = await OrderItem.find({ product: id }).limit(1).count()

        if (count === 1) {
            return res.sendStatus(200)
        }
        return res.sendStatus(204)

    } catch (err) {
        console.error(`[product.checkProduct]  ${strings.DB_ERROR} ${id}`, err)
        return res.status(400).send(strings.DB_ERROR + err)
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)

        if (product) {
            const _image = path.join(CDN_PRODUCTS, product.image)

            if (await Helper.exists(_image)) {
                await fs.unlink(_image)
            }

            for (const image of product.images) {
                const _image = path.join(CDN_PRODUCTS, image)

                if (await Helper.exists(_image)) {
                    await fs.unlink(_image)
                }
            }

            await CartItem.deleteMany({ product: product._id })

            return res.sendStatus(200)
        } else {
            return res.sendStatus(204)
        }
    } catch (err) {
        console.error(strings.ERROR, err)
        return res.status(400).send(strings.ERROR + err)
    }
}

export const getProduct = async (req, res) => {
    try {
        const _id = new mongoose.Types.ObjectId(req.params.id)
        const language = req.params.language

        const { cart: cartId } = req.body
        let cartProducts = []
        if (cartId) {
            const _cart = await Cart.findById(cartId).populate('cartItems').lean()

            if (_cart) {
                cartProducts = _cart.cartItems.map(cartItem => cartItem.product)
            }
        }

        const products = await Product.aggregate([
            {
                $match: {
                    $expr: { $eq: ['$_id', _id] }
                }
            },
            {
                $lookup: {
                    from: 'Category',
                    let: { categories: '$categories' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$categories'] }
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
                    ],
                    as: 'categories'
                }
            },
            {
                $addFields: {
                    inCart: {
                        $cond: [{ $in: ['$_id', cartProducts] }, 1, 0]
                    }
                }
            },
        ])

        if (products.length > 0) {
            return res.json(products[0])
        } else {
            return res.sendStatus(204)
        }
    } catch (err) {
        console.error(strings.ERROR, err)
        return res.status(400).send(strings.ERROR + err)
    }
}

export const getBackendProducts = async (req, res) => {
    try {
        // cat 1 634a9cf7d21ed77c797b7846
        // cat 10 634a9cf7d21ed77c797b787c
        // cat 11 634a9cf7d21ed77c797b7882

        // for (let i = 36; i <= 71; i++) {
        //     await new Product({
        //         name: `Product ${i}`,
        //         description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        //         categories: ['634a9cf7d21ed77c797b7882'],
        //         image: '81iD7QhS30L._AC_SL1500_.jpg',
        //         price: i * 1000,
        //         quantity: 1,
        //     }).save()
        // }

        const { user: userId } = req.params

        const user = await User.find({ _id: userId, type: Env.USER_TYPE.ADMIN })

        if (!user) {
            const err = `[product.getBackendProducts] admin user ${userId} not found.`
            console.error(err)
            return res.status(204).send(err)
        }

        const page = parseInt(req.params.page)
        const size = parseInt(req.params.size)
        const keyword = escapeStringRegexp(req.query.s || '')
        const options = 'i'

        let category
        if (req.params.category) {
            category = new mongoose.Types.ObjectId(req.params.category)
        }

        let $match
        if (category) {
            $match = {
                $and: [
                    {
                        categories: category
                    },
                    {
                        name: { $regex: keyword, $options: options }
                    }
                ]
            }
        } else {
            $match = {
                name: { $regex: keyword, $options: options }
            }
        }

        const products = await Product.aggregate([
            {
                $match
            },
            {
                $project: {
                    categories: 0,
                    description: 0
                }
            },
            {
                $facet: {
                    resultData: [
                        { $sort: { createdAt: -1 } },
                        { $skip: ((page - 1) * size) },
                        { $limit: size },
                    ],
                    pageInfo: [
                        {
                            $count: 'totalRecords'
                        }
                    ]
                }
            }
        ], { collation: { locale: Env.DEFAULT_LANGUAGE, strength: 2 } })

        return res.json(products)
    } catch (err) {
        console.error(strings.ERROR, err)
        return res.status(400).send(strings.ERROR + err)
    }
}

export const getFrontendProducts = async (req, res) => {
    try {
        const page = parseInt(req.params.page)
        const size = parseInt(req.params.size)
        const keyword = escapeStringRegexp(req.query.s || '')
        const options = 'i'

        let category
        if (req.params.category) {
            category = new mongoose.Types.ObjectId(req.params.category)
        }

        const { cart: cartId } = req.body
        let cartProducts = []
        if (cartId) {
            const _cart = await Cart.findById(cartId).populate('cartItems').lean()

            if (_cart) {
                cartProducts = _cart.cartItems.map(cartItem => cartItem.product)
            }
        }

        let $match
        if (category) {
            $match = {
                $and: [
                    {
                        categories: category
                    },
                    {
                        name: { $regex: keyword, $options: options }
                    },
                    {
                        hidden: false
                    }
                ]
            }
        } else {
            $match = {
                $and: [
                    {
                        name: { $regex: keyword, $options: options }
                    },
                    {
                        hidden: false
                    }
                ]
            }
        }

        // TODO after: sort by price asc, desc
        const products = await Product.aggregate([
            {
                $match
            },
            {
                $addFields: {
                    inCart: {
                        $cond: [{ $in: ['$_id', cartProducts] }, 1, 0]
                    }
                }
            },
            {
                $project: {
                    categories: 0,
                    description: 0
                }
            },
            {
                $facet: {
                    resultData: [
                        { $sort: { createdAt: -1 } },
                        { $skip: ((page - 1) * size) },
                        { $limit: size },
                    ],
                    pageInfo: [
                        {
                            $count: 'totalRecords'
                        }
                    ]
                }
            }
        ], { collation: { locale: Env.DEFAULT_LANGUAGE, strength: 2 } })

        return res.json(products)

        return res.sendStatus(200)
    } catch (err) {
        console.error(strings.ERROR, err)
        return res.status(400).send(strings.ERROR + err)
    }
}
