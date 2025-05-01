import 'dotenv/config'
import url from 'node:url'
import path from 'node:path'
import asyncFs from 'node:fs/promises'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import app from '../src/app'
import * as env from '../src/config/env.config'
import * as helper from '../src/common/helper'
import Product from '../src/models/Product'
import OrderItem from '../src/models/OrderItem'
import Order from '../src/models/Order'
import DeliveryType from '../src/models/DeliveryType'
import PaymentType from '../src/models/PaymentType'
import CartItem from '../src/models/CartItem'
import Cart from '../src/models/Cart'
import Wishlist from '../src/models/Wishlist'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGE1 = 'product1.jpg'
const IMAGE1_PATH = path.resolve(__dirname, `./img/${IMAGE1}`)
const IMAGE1_1 = 'product1-1.jpg'
const IMAGE1_1_PATH = path.resolve(__dirname, `./img/${IMAGE1_1}`)
const IMAGE1_2 = 'product1-2.jpg'
const IMAGE1_2_PATH = path.resolve(__dirname, `./img/${IMAGE1_2}`)

const IMAGE2 = 'product2.jpg'
const IMAGE2_PATH = path.resolve(__dirname, `./img/${IMAGE2}`)
const IMAGE2_1 = 'product2-1.jpg'
const IMAGE2_1_PATH = path.resolve(__dirname, `./img/${IMAGE2_1}`)
const IMAGE2_2 = 'product2-2.jpg'
const IMAGE2_2_PATH = path.resolve(__dirname, `./img/${IMAGE2_2}`)

const CATEGORY_ID = testHelper.GetRandromObjectIdAsString()
let USER_ID: string
let ADMIN_ID: string
let PRODUCT_ID: string

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  await databaseHelper.connect(env.DB_URI, false, false)

  await testHelper.initialize()

  USER_ID = testHelper.getUserId()
  ADMIN_ID = testHelper.getAdminUserId()
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
  if (mongoose.connection.readyState) {
    await testHelper.close()
    await databaseHelper.close()
  }
})

//
// Unit tests
//

describe('POST /api/upload-image', () => {
  it('should upload product image', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const image = path.join(env.CDN_TEMP_PRODUCTS, IMAGE1)
    if (!(await helper.pathExists(image))) {
      await asyncFs.copyFile(IMAGE1_PATH, image)
    }

    // test success
    let res = await request(app)
      .post('/api/upload-image')
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', image)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    const imagePath = path.join(env.CDN_TEMP_PRODUCTS, res.body)
    expect(await helper.pathExists(imagePath)).toBeTruthy()

    // cleanup
    await asyncFs.unlink(imagePath)

    // test failure (no file)
    res = await request(app)
      .post('/api/upload-image')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/delete-temp-image/:fileName', () => {
  it('should delete temp product image', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const image = path.join(env.CDN_TEMP_PRODUCTS, IMAGE1)
    if (!(await helper.pathExists(image))) {
      await asyncFs.copyFile(IMAGE1_PATH, image)
    }

    // test success
    let res = await request(app)
      .post(`/api/delete-temp-image/${IMAGE1}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    // test failure (image not found)
    res = await request(app)
      .post('/api/delete-temp-image/not-found.jpg')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/delete-image/:product/:image', () => {
  it('should delete product image', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const image1 = path.join(env.CDN_PRODUCTS, IMAGE1_1)
    if (!(await helper.pathExists(image1))) {
      await asyncFs.copyFile(IMAGE1_1_PATH, image1)
    }
    const image2 = path.join(env.CDN_PRODUCTS, IMAGE1_2)
    if (!(await helper.pathExists(image2))) {
      await asyncFs.copyFile(IMAGE1_2_PATH, image2)
    }
    const product = new Product({
      name: 'Product',
      description: 'Description',
      categories: [CATEGORY_ID],
      price: 10,
      quantity: 2,
      images: [IMAGE1_1, IMAGE1_2, 'not-found.jpg'],
    })
    await product.save()

    // test success
    let res = await request(app)
      .post(`/api/delete-image/${product.id}/${IMAGE1_2}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(await helper.pathExists(image1)).toBeTruthy()
    expect(await helper.pathExists(image2)).toBeFalsy()

    // test success (file not found)
    res = await request(app)
      .post(`/api/delete-image/${product.id}/not-found.jpg`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    // test success (file not in images)
    res = await request(app)
      .post(`/api/delete-image/${product.id}/not-in-images.jpg`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // cleanup
    await asyncFs.unlink(image1)
    await product.deleteOne()

    // test product not found
    res = await request(app)
      .post(`/api/delete-image/${testHelper.GetRandromObjectIdAsString()}/${IMAGE1_2}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (product id not valid)
    res = await request(app)
      .post(`/api/delete-image/0/${IMAGE1_2}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/create-product', () => {
  it('should create a product', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const image = path.join(env.CDN_TEMP_PRODUCTS, IMAGE1)
    if (!(await helper.pathExists(image))) {
      await asyncFs.copyFile(IMAGE1_PATH, image)
    }
    const image1 = path.join(env.CDN_TEMP_PRODUCTS, IMAGE1_1)
    if (!(await helper.pathExists(image1))) {
      await asyncFs.copyFile(IMAGE1_1_PATH, image1)
    }
    const image2 = path.join(env.CDN_TEMP_PRODUCTS, IMAGE1_2)
    if (!(await helper.pathExists(image2))) {
      await asyncFs.copyFile(IMAGE1_2_PATH, image2)
    }

    // test success
    const payload: wexcommerceTypes.CreateProductPayload = {
      name: 'Product',
      description: 'Description',
      categories: [CATEGORY_ID],
      image: IMAGE1,
      price: 10,
      quantity: 2,
      soldOut: true,
      hidden: true,
      images: [IMAGE1_1, IMAGE1_2],
      featured: false,
    }
    let res = await request(app)
      .post('/api/create-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    expect(res.body.name).toBe(payload.name)
    expect(res.body.description).toBe(payload.description)
    expect(res.body.categories).toStrictEqual(payload.categories)
    const imagePath = path.join(env.CDN_PRODUCTS, res.body.image)
    expect(await helper.pathExists(imagePath)).toBeTruthy()
    for (const img of res.body.images) {
      expect(await helper.pathExists(path.join(env.CDN_PRODUCTS, img))).toBeTruthy()
    }
    expect(res.body.price).toBe(payload.price)
    expect(res.body.quantity).toBe(payload.quantity)
    expect(res.body.soldOut).toBe(payload.soldOut)
    expect(res.body.hidden).toBe(payload.hidden)
    expect(res.body.featured).toBe(payload.featured)
    PRODUCT_ID = res.body._id

    // test failure (no payload)
    res = await request(app)
      .post('/api/create-product')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // test failure (no main image)
    payload.image = undefined
    res = await request(app)
      .post('/api/create-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (main image not found)
    payload.image = 'not-found.jpg'
    res = await request(app)
      .post('/api/create-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (additional image not found)
    await asyncFs.copyFile(IMAGE1_PATH, image)
    payload.image = IMAGE1
    res = await request(app)
      .post('/api/create-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('PUT /api/update-product', () => {
  it('should update a product', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const image = path.join(env.CDN_TEMP_PRODUCTS, IMAGE2)
    if (!(await helper.pathExists(image))) {
      await asyncFs.copyFile(IMAGE2_PATH, image)
    }
    const image1 = path.join(env.CDN_TEMP_PRODUCTS, IMAGE2_1)
    if (!(await helper.pathExists(image1))) {
      await asyncFs.copyFile(IMAGE2_1_PATH, image1)
    }
    const image2 = path.join(env.CDN_TEMP_PRODUCTS, IMAGE2_2)
    if (!(await helper.pathExists(image2))) {
      await asyncFs.copyFile(IMAGE2_2_PATH, image2)
    }

    // test success
    const payload: wexcommerceTypes.UpdateProductPayload = {
      _id: PRODUCT_ID,
      categories: [testHelper.GetRandromObjectIdAsString()],
      name: 'Product updated',
      description: 'Description updated',
      image: IMAGE2,
      price: 11,
      quantity: 3,
      soldOut: false,
      hidden: false,
      images: [],
      tempImages: [IMAGE2_1],
      featured: true,
    }
    let res = await request(app)
      .put('/api/update-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    expect(res.body.name).toBe(payload.name)
    expect(res.body.description).toBe(payload.description)
    expect(res.body.categories).toStrictEqual(payload.categories)
    expect(await helper.pathExists(path.join(env.CDN_PRODUCTS, res.body.image))).toBeTruthy()
    expect(res.body.images.length).toBe(1)
    for (const img of res.body.images) {
      expect(await helper.pathExists(path.join(env.CDN_PRODUCTS, img))).toBeTruthy()
    }
    expect(res.body.price).toBe(payload.price)
    expect(res.body.quantity).toBe(payload.quantity)
    expect(res.body.soldOut).toBe(payload.soldOut)
    expect(res.body.hidden).toBe(payload.hidden)
    expect(res.body.featured).toBe(payload.featured)

    // test success (add image to existing images)
    await asyncFs.copyFile(IMAGE1_PATH, path.join(env.CDN_PRODUCTS, IMAGE1))
    await asyncFs.copyFile(IMAGE2_PATH, image)
    await asyncFs.copyFile(IMAGE2_1_PATH, image1)
    await asyncFs.copyFile(IMAGE2_2_PATH, image2)
    let product = await Product.findById(PRODUCT_ID)
    product!.images = [...res.body.images, IMAGE1, 'not-found.jpg']
    await product!.save()
    payload.images = res.body.images
    payload.tempImages = [...payload.tempImages, IMAGE2_2, 'not-found.jpg']
    res = await request(app)
      .put('/api/update-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    expect(res.body.images.length).toBe(3)
    for (const img of res.body.images) {
      expect(await helper.pathExists(path.join(env.CDN_PRODUCTS, img))).toBeTruthy()
    }
    const mainImage = res.body.image

    // test success (add image and delete all other images)
    await asyncFs.copyFile(IMAGE1_PATH, path.join(env.CDN_PRODUCTS, IMAGE1))
    await asyncFs.copyFile(IMAGE2_PATH, image)
    await asyncFs.copyFile(IMAGE2_1_PATH, image1)
    await asyncFs.copyFile(IMAGE2_2_PATH, image2)
    product = await Product.findById(PRODUCT_ID)
    product!.image = 'not-found.jpg'
    product!.images = [...res.body.images, IMAGE1, 'not-found.jpg']
    await product!.save()
    payload.images = []
    payload.tempImages = [...payload.tempImages, IMAGE2_2, 'not-found.jpg']
    res = await request(app)
      .put('/api/update-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    expect(res.body.images.length).toBe(2)
    for (const img of res.body.images) {
      expect(await helper.pathExists(path.join(env.CDN_PRODUCTS, img))).toBeTruthy()
    }
    product!.image = mainImage
    await product!.save()

    // test success (no change in images)
    payload.image = undefined
    payload.images = res.body.images
    payload.tempImages = []
    res = await request(app)
      .put('/api/update-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()

    // test failure (image not found)
    payload.image = 'not-found.jpg'
    res = await request(app)
      .put('/api/update-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (product not found)
    payload._id = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .put('/api/update-product')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/check-product/:id', () => {
  it('should check if a product is related to an order', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const orderItem = new OrderItem({ product: PRODUCT_ID, quantity: 1 })
    await orderItem.save()

    // test success
    let res = await request(app)
      .get(`/api/check-product/${PRODUCT_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    // cleanup
    await orderItem.deleteOne()

    // test not related
    res = await request(app)
      .get(`/api/check-product/${PRODUCT_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (product id not valid)
    res = await request(app)
      .get('/api/check-product/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/product/:id/:language', () => {
  it('should get a product', async () => {
    // init
    const cartItem = new CartItem({ product: PRODUCT_ID })
    await cartItem.save()
    const cart = new Cart({ user: USER_ID, cartItems: [cartItem.id] })
    await cart.save()

    const wishlist = new Wishlist({ user: testHelper.getUserId(), products: [PRODUCT_ID] })
    await wishlist.save()

    // test success
    const payload: wexcommerceTypes.GetProductPayload = { cart: cart.id, wishlist: wishlist.id }
    let res = await request(app)
      .post(`/api/product/${PRODUCT_ID}/en`)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()

    // cleanup
    await cartItem.deleteOne()
    await cart.deleteOne()
    await wishlist.deleteOne()

    // test success (no cart, no wishlist)
    payload.cart = undefined
    payload.wishlist = undefined
    res = await request(app)
      .post(`/api/product/${PRODUCT_ID}/en`)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()

    // test success (no cart, no wishlist in db)
    payload.cart = testHelper.GetRandromObjectIdAsString()
    payload.wishlist = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post(`/api/product/${PRODUCT_ID}/en`)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()

    // test failure (product id not valid)
    res = await request(app)
      .post('/api/product/0/en')
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test product not found
    res = await request(app)
      .post(`/api/product/${testHelper.GetRandromObjectIdAsString()}/en`)
      .send(payload)
    expect(res.statusCode).toBe(204)

    // test failure (language not valid)
    res = await request(app)
      .post(`/api/product/${PRODUCT_ID}/english`)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/backend-products/:user/:page/:size/:category?', () => {
  it('should get backend products', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    const payload: wexcommerceTypes.GetBackendProductsPayload = { sortBy: wexcommerceTypes.SortProductBy.priceAsc }
    let res = await request(app)
      .post(`/api/backend-products/${ADMIN_ID}/1/10/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)

    // test success (sort by feaured)
    payload.sortBy = wexcommerceTypes.SortProductBy.featured
    res = await request(app)
    .post(`/api/backend-products/${ADMIN_ID}/1/10/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)

    // test success (sort by date)
    payload.sortBy = wexcommerceTypes.SortProductBy.dateDesc
    res = await request(app)
    .post(`/api/backend-products/${ADMIN_ID}/1/10/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)

    // test success (no category and sort by priceDesc)
    payload.sortBy = wexcommerceTypes.SortProductBy.priceDesc
    res = await request(app)
      .post(`/api/backend-products/${ADMIN_ID}/1/10`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // test success (no sortBy)
    payload.sortBy = undefined
    res = await request(app)
      .post(`/api/backend-products/${ADMIN_ID}/1/10/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // test failure (user id not valid)
    res = await request(app)
      .post(`/api/backend-products/0/1/10/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (admin user not found)
    res = await request(app)
      .post(`/api/backend-products/${testHelper.GetRandromObjectIdAsString()}/1/10/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/frontend-products/:page/:size/:category?', () => {
  it('should get frontend products', async () => {
    // init
    const cartItem = new CartItem({ product: PRODUCT_ID })
    await cartItem.save()
    const cart = new Cart({ user: USER_ID, cartItems: [cartItem.id] })
    await cart.save()

    const wishlist = new Wishlist({ user: testHelper.getUserId(), products: [PRODUCT_ID] })
    await wishlist.save()

    // test success
    const payload: wexcommerceTypes.GetProductsPayload = { cart: cart.id, wishlist: wishlist.id, sortBy: wexcommerceTypes.SortProductBy.priceAsc }
    let res = await request(app)
      .post(`/api/frontend-products/1/10/${CATEGORY_ID}`)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)

    // test success (sort by featured)
    payload.cart = undefined
    payload.wishlist = undefined
    payload.sortBy = wexcommerceTypes.SortProductBy.featured
    res = await request(app)
      .post(`/api/frontend-products/1/10/${CATEGORY_ID}`)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)

    // test success (sort by date)
    payload.cart = undefined
    payload.wishlist = undefined
    payload.sortBy = wexcommerceTypes.SortProductBy.dateDesc
    res = await request(app)
      .post(`/api/frontend-products/1/10/${CATEGORY_ID}`)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)

    // test success (no cart, no wishlist and sort by price desc)
    payload.cart = undefined
    payload.wishlist = undefined
    payload.sortBy = wexcommerceTypes.SortProductBy.priceDesc
    res = await request(app)
      .post(`/api/frontend-products/1/10/${CATEGORY_ID}`)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)

    // test success (no cart, no wishlist, no category)
    payload.sortBy = undefined
    res = await request(app)
      .post('/api/frontend-products/1/10')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // test success (no cart, no wishlist in db)
    payload.cart = testHelper.GetRandromObjectIdAsString()
    payload.wishlist = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post('/api/frontend-products/1/10')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // cleanup
    await cartItem.deleteOne()
    await cart.deleteOne()
    await wishlist.deleteOne()

    // test failure (cart id not valid)
    payload.cart = '0'
    res = await request(app)
      .post(`/api/frontend-products/1/10/${CATEGORY_ID}`)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/featured-products', () => {
  it('should get featured products', async () => {
    // init
    const cartItem = new CartItem({ product: PRODUCT_ID })
    await cartItem.save()
    const cart = new Cart({ user: USER_ID, cartItems: [cartItem.id] })
    await cart.save()

    const wishlist = new Wishlist({ user: testHelper.getUserId(), products: [PRODUCT_ID] })
    await wishlist.save()

    // test success
    const payload: wexcommerceTypes.GetProductsPayload = { cart: cart.id, wishlist: wishlist.id, sortBy: wexcommerceTypes.SortProductBy.priceAsc }
    let res = await request(app)
      .post('/api/featured-products')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // test success (no cart, no wishlist)
    payload.cart = undefined
    payload.wishlist = undefined
    payload.sortBy = wexcommerceTypes.SortProductBy.priceDesc
    res = await request(app)
      .post('/api/featured-products')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // test success (no cart, no wishlist, no category)
    payload.sortBy = undefined
    res = await request(app)
      .post('/api/featured-products')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // test success (no cart, no wishlist in db)
    payload.cart = testHelper.GetRandromObjectIdAsString()
    payload.wishlist = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post('/api/featured-products')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // cleanup
    await cartItem.deleteOne()
    await cart.deleteOne()
    await wishlist.deleteOne()

    // test failure (cart id not valid)
    payload.cart = '0'
    res = await request(app)
      .post('/api/featured-products')
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/delete-product/:id', () => {
  it('should delete a product', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    let product = await Product.findById(PRODUCT_ID)
    let orderItem = new OrderItem({ product: PRODUCT_ID, quantity: 1 })
    await orderItem.save()
    const order = new Order({
      user: USER_ID,
      orderItems: [orderItem.id],
      status: wexcommerceTypes.OrderStatus.Paid,
      deliveryType: (await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Withdrawal }))?._id,
      paymentType: (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard }))?._id,
      total: product!.price,
    })
    await order.save()

    // test success
    let res = await request(app)
      .delete(`/api/delete-product/${PRODUCT_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(await helper.pathExists(path.join(env.CDN_PRODUCTS, product!.image!))).toBeFalsy()
    for (const img of product!.images) {
      expect(await helper.pathExists(path.join(env.CDN_PRODUCTS, img))).toBeFalsy()
    }
    expect(await OrderItem.findById(orderItem.id)).toBeFalsy()
    expect(await Order.findById(order.id)).toBeFalsy()

    // test success (images not found)
    product = new Product({
      name: 'Product',
      description: 'Description',
      categories: [testHelper.GetRandromObjectIdAsString()],
      price: 10,
      quantity: 2,
      image: 'not-found.jpg',
      images: ['not-found.jpg'],
    })
    await product.save()
    orderItem = new OrderItem({ product: product.id, quantity: 1 })
    await orderItem.save()
    res = await request(app)
      .delete(`/api/delete-product/${product.id}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(await Product.findById(product.id)).toBeFalsy()
    expect(await OrderItem.findById(orderItem.id)).toBeFalsy()

    // test success (no images)
    product = new Product({
      name: 'Product',
      description: 'Description',
      categories: [testHelper.GetRandromObjectIdAsString()],
      price: 10,
      quantity: 2,
    })
    await product.save()
    res = await request(app)
      .delete(`/api/delete-product/${product.id}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(await Product.findById(product.id)).toBeFalsy()

    // test product not found
    res = await request(app)
      .delete(`/api/delete-product/${PRODUCT_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (product id not valid)
    res = await request(app)
      .delete('/api/delete-product/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})
