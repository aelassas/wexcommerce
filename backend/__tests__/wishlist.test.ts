import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as databaseHelper from '../src/utils/databaseHelper'
import * as testHelper from './testHelper'
import app from '../src/app'
import * as env from '../src/config/env.config'
import Product from '../src/models/Product'
import Wishlist from '../src/models/Wishlist'

let PRODUCT1_ID: string
let PRODUCT2_ID: string
let USER_ID: string
let WISHLIST_ID: string

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

  PRODUCT1_ID = product1._id.toString()
  PRODUCT2_ID = product2._id.toString()
  USER_ID = testHelper.getUserId()
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
  if (mongoose.connection.readyState) {
    await Product.deleteMany({ _id: { $in: [PRODUCT1_ID, PRODUCT2_ID] } })
    await Wishlist.deleteOne({ _id: WISHLIST_ID })
    await testHelper.close()
    await databaseHelper.close()
  }
})

//
// Unit tests
//

describe('POST /api/add-wishlist-item', () => {
  it('should add a wishlist item', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const wishlist = new Wishlist({ user: USER_ID, products: [PRODUCT1_ID] })
    await wishlist.save()

    // test success (wishlist exists)
    const payload: wexcommerceTypes.AddWishlistItemPayload = { userId: USER_ID, productId: PRODUCT2_ID }
    let res = await request(app)
      .post('/api/add-wishlist-item')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()

    // test success (no wishlist)
    await wishlist.deleteOne()
    res = await request(app)
      .post('/api/add-wishlist-item')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    WISHLIST_ID = res.body

    // test add product1 to wishlist
    payload.productId = PRODUCT1_ID
    res = await request(app)
      .post('/api/add-wishlist-item')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    expect((await Wishlist.findOne({ _id: WISHLIST_ID }))?.products.length).toBe(2)

    // test failure (user id not valid)
    payload.userId = '0'
    res = await request(app)
      .post('/api/add-wishlist-item')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (product id not valid)
    payload.userId = USER_ID
    payload.productId = '0'
    res = await request(app)
      .post('/api/add-wishlist-item')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (user not found)
    payload.userId = testHelper.GetRandromObjectIdAsString()
    payload.productId = PRODUCT2_ID
    res = await request(app)
      .post('/api/add-wishlist-item')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/delete-wishlist-item/:wishlist/:product', () => {
  it('should delete a wishlist item', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    expect(await Wishlist.findOne({ _id: WISHLIST_ID, products: PRODUCT2_ID })).toBeTruthy()
    let res = await request(app)
      .delete(`/api/delete-wishlist-item/${WISHLIST_ID}/${PRODUCT2_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(await Wishlist.findOne({ _id: WISHLIST_ID, products: PRODUCT2_ID })).toBeFalsy()
    expect((await Wishlist.findOne({ _id: WISHLIST_ID }))?.products.length).toBe(1)

    // test wishlist not found
    res = await request(app)
      .delete(`/api/delete-wishlist-item/${testHelper.GetRandromObjectIdAsString()}/${PRODUCT2_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (wishlist id not valid)
    res = await request(app)
      .delete(`/api/delete-wishlist-item/0/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // test failure (product id not valid)
    res = await request(app)
      .delete(`/api/delete-wishlist-item/${testHelper.GetRandromObjectIdAsString()}/0`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/wishlist/:id', () => {
  it('should get a wishlist', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .get(`/api/wishlist/${WISHLIST_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()

    // test wishlist not found
    res = await request(app)
      .get(`/api/wishlist/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (id not valid)
    res = await request(app)
      .get('/api/wishlist/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/wishlist-count/:id', () => {
  it('should get a wishlist count', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .get(`/api/wishlist-count/${WISHLIST_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe(1)

    // test wishlist not found
    res = await request(app)
      .get(`/api/wishlist-count/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe(0)

    // test failure (id not valid)
    res = await request(app)
      .get('/api/wishlist-count/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/wishlist-id/:user', () => {
  it('should get wishlist id', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .get(`/api/wishlist-id/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe(WISHLIST_ID)

    // test wishlist not found
    res = await request(app)
      .get(`/api/wishlist-id/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeNull()

    // test failure (user id not valid)
    res = await request(app)
      .get('/api/wishlist-id/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/clear-wishlist/:id', () => {
  it('should get wishlist id', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let wishlist = await Wishlist.findById(WISHLIST_ID)
    expect(wishlist!.products.length).toBe(1)
    let res = await request(app)
      .delete(`/api/clear-wishlist/${WISHLIST_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    wishlist = await Wishlist.findById(WISHLIST_ID)
    expect(wishlist!.products.length).toBe(0)

    // test wishlist not found
    res = await request(app)
      .delete(`/api/clear-wishlist/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (wishlist id not valid)
    res = await request(app)
      .delete('/api/clear-wishlist/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('PUT /api/update-wishlist/:id/:user', () => {
  it("should update wishlist's user", async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const randomUserId = testHelper.GetRandromObjectIdAsString()

    // test success (random user id)
    let res = await request(app)
      .put(`/api/update-wishlist/${WISHLIST_ID}/${randomUserId}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    let wishlist = await Wishlist.findById(WISHLIST_ID)
    expect(wishlist!.user.toString()).toBe(randomUserId)

    // test success (user id)
    res = await request(app)
      .put(`/api/update-wishlist/${WISHLIST_ID}/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    wishlist = await Wishlist.findById(WISHLIST_ID)
    expect(wishlist!.user.toString()).toBe(USER_ID)

    // test wishlist not found
    res = await request(app)
      .put(`/api/update-wishlist/${testHelper.GetRandromObjectIdAsString()}/${randomUserId}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (wishlist id not valid)
    res = await request(app)
      .put(`/api/update-wishlist/0/${randomUserId}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // test failure (user id not valid)
    res = await request(app)
      .put(`/api/update-wishlist/${WISHLIST_ID}/0`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/check-wishlist/:id/:user', () => {
  it('should check wishlist if wishlist exists', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .get(`/api/check-wishlist/${WISHLIST_ID}/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    // test wishlist not found
    res = await request(app)
      .get(`/api/check-wishlist/${testHelper.GetRandromObjectIdAsString()}/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (wishlist id not valid)
    res = await request(app)
      .get(`/api/check-wishlist/0/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // test failure (user id not valid)
    res = await request(app)
      .get(`/api/check-wishlist/${WISHLIST_ID}/0`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})
