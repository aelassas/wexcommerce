import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import app from '../src/app'
import * as env from '../src/config/env.config'
import Product from '../src/models/Product'
import CartItem from '../src/models/CartItem'
import Cart from '../src/models/Cart'

let PRODUCT1_ID: string
let PRODUCT2_ID: string
let USER_ID: string
let CART_ID: string

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  await databaseHelper.connect(env.DB_URI, false, false)

  await testHelper.initialize()

  const product1 = new Product({
    name: 'Product 1',
    description: 'Description',
    categories: [testHelper.GetRandromObjectIdAsString()],
    price: 10,
    quantity: 2,
  })
  await product1.save()

  const product2 = new Product({
    name: 'Product 2',
    description: 'Description',
    categories: [testHelper.GetRandromObjectIdAsString()],
    price: 10,
    quantity: 2,
  })
  await product2.save()

  PRODUCT1_ID = product1.id
  PRODUCT2_ID = product2.id
  USER_ID = testHelper.getUserId()
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
  if (mongoose.connection.readyState) {
    await Product.deleteMany({ _id: { $in: [PRODUCT1_ID, PRODUCT2_ID] } })
    await testHelper.close()
    await databaseHelper.close()
  }
})

//
// Unit tests
//

describe('POST /api/add-cart-item', () => {
  it('should add a cart item', async () => {
    // init
    const cartItem = new CartItem({ product: PRODUCT1_ID })
    await cartItem.save()
    const cart = new Cart({ user: USER_ID, cartItems: [cartItem.id] })
    await cart.save()

    // test success (no cart, user)
    const payload: wexcommerceTypes.AddItemPayload = { userId: USER_ID, cartId: '', productId: PRODUCT1_ID }
    let res = await request(app)
      .post('/api/add-cart-item')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    expect(await CartItem.findById(cartItem.id)).toBeFalsy()
    expect(await Cart.findById(cart.id)).toBeFalsy()
    CART_ID = res.body

    // test success (no cart, no user)
    payload.userId = ''
    res = await request(app)
      .post('/api/add-cart-item')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    const _cart = await Cart.findById(res.body)
    await CartItem.deleteMany({ _id: { $in: _cart!.cartItems } })
    await _cart!.deleteOne()

    // test success (cart, user)
    payload.userId = USER_ID
    payload.cartId = CART_ID
    payload.productId = PRODUCT2_ID
    res = await request(app)
      .post('/api/add-cart-item')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()

    // test failure (product id not valid)
    payload.productId = '0'
    res = await request(app)
      .post('/api/add-cart-item')
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('PUT /api/update-cart-item/:cartItem/:quantity', () => {
  it('should update a cart item', async () => {
    // init
    const cart = await Cart.findById(CART_ID)
    const cartItemId = cart?.cartItems[0]

    // test success
    let res = await request(app)
      .put(`/api/update-cart-item/${cartItemId}/${2}`)
    expect(res.statusCode).toBe(200)
    const cartItem = await CartItem.findById(cartItemId)
    expect(cartItem?.quantity).toBe(2)

    // test cartItem not found
    res = await request(app)
      .put(`/api/update-cart-item/${testHelper.GetRandromObjectIdAsString()}/${2}`)
    expect(res.statusCode).toBe(204)

    // test failure (quantity not valid)
    res = await request(app)
      .put(`/api/update-cart-item/${cartItemId}/not-a-number`)
    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/delete-cart-item/:cart/:product', () => {
  it('should delete a cart item', async () => {
    // test success (cart not deleted)
    let res = await request(app)
      .delete(`/api/delete-cart-item/${CART_ID}/${PRODUCT1_ID}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.cartDeleted).toBeFalsy()
    expect(res.body.quantity).toBe(2)

    // test success (cart deleted)
    res = await request(app)
      .delete(`/api/delete-cart-item/${CART_ID}/${PRODUCT2_ID}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.cartDeleted).toBeTruthy()
    expect(res.body.quantity).toBe(1)
    const cart = await Cart.findById(CART_ID)
    expect(cart).toBeFalsy()
    CART_ID = ''

    // test cart not found
    res = await request(app)
      .delete(`/api/delete-cart-item/${testHelper.GetRandromObjectIdAsString()}/${PRODUCT1_ID}`)
    expect(res.statusCode).toBe(204)

    // test failure (product id not valid)
    res = await request(app)
      .delete(`/api/delete-cart-item/${testHelper.GetRandromObjectIdAsString()}/0`)
    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/delete-cart/:id', () => {
  it('should delete a cart', async () => {
    // init
    const cartItem = new CartItem({ product: PRODUCT1_ID })
    await cartItem.save()
    const cart = new Cart({ user: USER_ID, cartItems: [cartItem.id] })
    await cart.save()

    // test success
    let res = await request(app)
      .delete(`/api/delete-cart/${cart.id}`)
    expect(res.statusCode).toBe(200)
    expect(await CartItem.findById(cartItem.id)).toBeFalsy()
    expect(await Cart.findById(cart.id)).toBeFalsy()

    // cleanup
    await cartItem.deleteOne()
    await cart.deleteOne()

    // test cart not found
    res = await request(app)
      .delete(`/api/delete-cart/${testHelper.GetRandromObjectIdAsString()}`)
    expect(res.statusCode).toBe(204)

    // test failure (id not valid)
    res = await request(app)
      .delete('/api/delete-cart/0')
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/cart/:id', () => {
  it('should get a cart', async () => {
    // init
    const cart = new Cart({ user: USER_ID, cartItems: [] })
    await cart.save()

    // test success
    let res = await request(app)
      .get(`/api/cart/${cart.id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()

    // cleanup
    await cart.deleteOne()

    // test cart not found
    res = await request(app)
      .get(`/api/cart/${cart.id}`)
    expect(res.statusCode).toBe(204)

    // test failure (id not valid)
    res = await request(app)
      .get('/api/cart/0')
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/cart-count/:id', () => {
  it('should get a cart count', async () => {
    // init
    const cartItem1 = new CartItem({ product: PRODUCT1_ID, quantity: 2 })
    await cartItem1.save()
    const cartItem2 = new CartItem({ product: PRODUCT2_ID, quantity: 1 })
    await cartItem2.save()
    const cart = new Cart({ user: USER_ID, cartItems: [cartItem1.id, cartItem2.id] })
    await cart.save()

    // test success
    let res = await request(app)
      .get(`/api/cart-count/${cart.id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe(3)

    // cleanup
    await cartItem1.deleteOne()
    await cartItem2.deleteOne()
    await cart.deleteOne()

    // test cart not found
    res = await request(app)
      .get(`/api/cart-count/${testHelper.GetRandromObjectIdAsString()}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe(0)

    // test failure (id not valid)
    res = await request(app)
      .get('/api/cart-count/0')
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/cart-id/:user', () => {
  it('should get cart id', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const cart = new Cart({ user: USER_ID, cartItems: [] })
    await cart.save()

    // test success
    let res = await request(app)
      .get(`/api/cart-id/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe(cart.id)

    // cleanup
    await cart.deleteOne()

    // test cart not found
    res = await request(app)
      .get(`/api/cart-id/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeNull()

    // test failure (id not valid)
    res = await request(app)
      .get('/api/cart-id/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('PUT /api/update-cart/:id/:user', () => {
  it("should update cart's user", async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const cart = new Cart({ user: USER_ID, cartItems: [] })
    await cart.save()
    const randomUserId = testHelper.GetRandromObjectIdAsString()

    // test success
    let res = await request(app)
      .put(`/api/update-cart/${cart.id}/${randomUserId}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    const _cart = await Cart.findById(cart.id)
    expect(_cart!.user.toString()).toBe(randomUserId)

    // cleanup
    await cart.deleteOne()

    // test cart not found
    res = await request(app)
      .put(`/api/update-cart/${cart.id}/${randomUserId}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (cart id not valid)
    res = await request(app)
      .put(`/api/update-cart/0/${randomUserId}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // test failure (user id not valid)
    res = await request(app)
      .put(`/api/update-cart/${cart.id}/0`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/check-cart/:id', () => {
  it('should check cart if cart exists', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const cart = new Cart({ user: USER_ID, cartItems: [] })
    await cart.save()

    // test success
    let res = await request(app)
      .get(`/api/check-cart/${cart.id}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    // cleanup
    await cart.deleteOne()

    // test cart not found
    res = await request(app)
      .get(`/api/check-cart/${cart.id}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (cart id not valid)
    res = await request(app)
      .get('/api/check-cart/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/clear-other-carts/:id/:user', () => {
  it('should clear other carts', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const cart = new Cart({ user: USER_ID, cartItems: [] })
    await cart.save()
    await new Cart({ user: USER_ID, cartItems: [] }).save()
    await new Cart({ user: USER_ID, cartItems: [] }).save()

    // test success
    let otherCarts = await Cart.find({ user: USER_ID, _id: { $ne: cart.id } }).countDocuments()
    expect(otherCarts).toBe(2)
    let res = await request(app)
      .delete(`/api/clear-other-carts/${cart.id}/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    otherCarts = await Cart.find({ user: USER_ID, _id: { $ne: cart.id } }).countDocuments()
    expect(otherCarts).toBe(0)

    // cleanup
    await cart.deleteOne()

    // test cart not found
    res = await request(app)
      .delete(`/api/clear-other-carts/${cart.id}/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (cart id not valid)
    res = await request(app)
      .delete(`/api/clear-other-carts/0/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // test failure (user id not valid)
    res = await request(app)
      .delete(`/api/clear-other-carts/${cart.id}/0`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})
