import 'dotenv/config'
import url from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import app from '../src/app'
import * as env from '../src/config/env.config'
import * as helper from '../src/common/helper'
import Value from '../src/models/Value'
import Category from '../src/models/Category'
import Product from '../src/models/Product'
import CartItem from '../src/models/CartItem'
import Cart from '../src/models/Cart'
import Wishlist from '../src/models/Wishlist'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGE1 = 'category1.jpg'
const IMAGE1_PATH = path.resolve(__dirname, `./img/${IMAGE1}`)

const IMAGE2 = 'category2.jpg'
const IMAGE2_PATH = path.resolve(__dirname, `./img/${IMAGE2}`)

let CATEGORY_ID: string
//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  const res = await databaseHelper.connect(env.DB_URI, false, false)
  expect(res).toBeTruthy()

  await testHelper.initialize()
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

describe('POST /api/validate-category', () => {
  it('should validate a category', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    const name = testHelper.getRandomString()
    const payload: wexcommerceTypes.ValidateCategoryPayload = { language: 'en', value: name }
    let res = await request(app)
      .post('/api/validate-category')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    // test failure (not valid)
    const value = new Value({ language: 'en', value: name })
    await value.save()
    const cat = new Category({ values: [value.id] })
    await cat.save()
    res = await request(app)
      .post('/api/validate-category')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)
    await value.deleteOne()
    await cat.deleteOne()

    // test failure (no payload)
    res = await request(app)
      .post('/api/validate-category')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/check-category/:id', () => {
  it('should check if a category is linked to a product', async () => {
    const token = await testHelper.signinAsAdmin()

    // test category not linked to a product
    const cat = new Category()
    await cat.save()
    let res = await request(app)
      .get(`/api/check-category/${cat.id}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test category linked to a product
    const product = new Product({
      name: 'Product',
      description: 'Description',
      categories: [cat.id],
      price: 10,
      quantity: 2,
    })
    await product.save()
    res = await request(app)
      .get(`/api/check-category/${cat.id}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .get('/api/check-category/unknown')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // cleanup
    await product.deleteOne()
    await cat.deleteOne()
  })
})

describe('POST /api/create-category', () => {
  it('should create a category', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const image = path.join(env.CDN_TEMP_CATEGORIES, IMAGE1)
    if (!await helper.exists(image)) {
      await fs.copyFile(IMAGE1_PATH, image)
    }
    const payload: wexcommerceTypes.UpsertCategoryPayload = {
      values: [
        { language: 'en', value: 'test.category1' },
        { language: 'fr', value: 'test.categorie1' },
      ],
      featured: true,
      image: IMAGE1,
    }

    // test success
    let res = await request(app)
      .post('/api/create-category')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
    expect(await helper.exists(image)).toBeFalsy()
    expect(await helper.exists(path.join(env.CDN_CATEGORIES, res.body.image))).toBeTruthy()
    CATEGORY_ID = res.body._id

    // test failure (image not found)
    payload.image = 'not-found.jpg'
    res = await request(app)
      .post('/api/create-category')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (no payload)
    res = await request(app)
      .post('/api/create-category')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('PUT /api/update-category/:id', () => {
  it('should update a category', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    const payload: wexcommerceTypes.UpsertCategoryPayload = {
      values: [
        { language: 'en', value: 'test.category1-updated' },
        { language: 'fr', value: 'test.categorie1-updated' },
        { language: 'es', value: 'test.categoría1' },
      ],
      featured: false,
    }
    let res = await request(app)
      .put(`/api/update-category/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.featured).toBeFalsy()

    // test category not found
    res = await request(app)
      .put(`/api/update-category/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    // test failure (no payload)
    res = await request(app)
      .put(`/api/update-category/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/category/:id/:language', () => {
  it('should get a category', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .get(`/api/category/${CATEGORY_ID}/en`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body._id).toBeTruthy()

    // test category not found
    res = await request(app)
      .get(`/api/category/${testHelper.GetRandromObjectIdAsString()}/en`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (Id not valid)
    res = await request(app)
      .get('/api/category/0/en')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // test failure (Language not valid)
    res = await request(app)
      .get(`/api/category/${testHelper.GetRandromObjectIdAsString()}/english`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/categories/:language/:imageRequired', () => {
  it('should get categories', async () => {
    // test success
    let res = await request(app)
      .get('/api/categories/en/true')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // test failure (language not valid)
    res = await request(app)
      .get('/api/categories/english/true')
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/featured-categories/:language/:size', () => {
  it('should get featured categories', async () => {
    // init
    const size = 1
    const product = new Product({
      name: 'Product',
      description: 'Description',
      categories: [CATEGORY_ID],
      price: 10,
      quantity: 2,
    })
    await product.save()

    const cartItem = new CartItem({ product: product.id })
    await cartItem.save()
    const cart = new Cart({ user: testHelper.getUserId(), cartItems: [cartItem.id] })
    await cart.save()

    const wishlist = new Wishlist({ user: testHelper.getUserId(), products: [product.id] })
    await wishlist.save()

    // test success
    let res = await request(app)
      .get(`/api/featured-categories/en/${size}/?c=${cart.id}&w=${wishlist.id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // test success (without cart and wishlist)
    res = await request(app)
      .get(`/api/featured-categories/en/${size}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // cleanup
    await product.deleteOne()
    await cartItem.deleteOne()
    await cart.deleteOne()
    await wishlist.deleteOne()

    // test failure (language not valid)
    res = await request(app)
      .get(`/api/featured-categories/english/${size}`)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/search-categories/:language', () => {
  it('should search categories', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .get('/api/search-categories/en')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    // test failure (language not valid)
    res = await request(app)
      .get('/api/search-categories/english')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/create-category-image', () => {
  it('should create category image', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .post('/api/create-category-image')
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE1_PATH)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    const imagePath = path.join(env.CDN_TEMP_CATEGORIES, res.body)
    expect(await helper.exists(imagePath)).toBeTruthy()
    await fs.unlink(imagePath)

    // test failure (no file)
    res = await request(app)
      .post('/api/create-category-image')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/delete-category-image/:id', () => {
  it('should delete category image', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const cat = await Category.findById(CATEGORY_ID)
    const imagePath = path.join(env.CDN_CATEGORIES, cat!.image!)
    expect(await helper.exists(imagePath)).toBeTruthy()

    // test success
    let res = await request(app)
      .post(`/api/delete-category-image/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(await helper.exists(imagePath)).toBeFalsy()

    // test category not found
    res = await request(app)
      .post(`/api/delete-category-image/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (Id not valid)
    res = await request(app)
      .post('/api/delete-category-image/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/update-category-image/:id', () => {
  it('should update category image', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success (no image)
    let res = await request(app)
      .post(`/api/update-category-image/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE2_PATH)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    let imagePath = path.join(env.CDN_CATEGORIES, res.body)
    expect(await helper.exists(imagePath)).toBeTruthy()

    // test success (image already exists)
    res = await request(app)
      .post(`/api/update-category-image/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE1_PATH)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeTruthy()
    imagePath = path.join(env.CDN_CATEGORIES, res.body)
    expect(await helper.exists(imagePath)).toBeTruthy()

    // test category not found
    res = await request(app)
      .post(`/api/update-category-image/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE2_PATH)
    expect(res.statusCode).toBe(204)

    // test failure (no file)
    res = await request(app)
      .post(`/api/update-category-image/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/delete-temp-category-image/:image', () => {
  it('should delete temp category image', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const image = path.join(env.CDN_TEMP_CATEGORIES, IMAGE1)
    if (!await helper.exists(image)) {
      await fs.copyFile(IMAGE1_PATH, image)
    }

    // test success
    let res = await request(app)
      .post(`/api/delete-temp-category-image/${IMAGE1}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    // test failure (image not found)
    res = await request(app)
      .post('/api/delete-temp-category-image/not-found.jpg')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/delete-category/:id', () => {
  it('should delete a category', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    let cat = await Category.findById(CATEGORY_ID)
    const image = path.join(env.CDN_CATEGORIES, cat!.image!)
    expect(cat).toBeTruthy()
    expect(await helper.exists(image)).toBeTruthy()

    // test success
    let res = await request(app)
      .delete(`/api/delete-category/${CATEGORY_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    cat = await Category.findById(CATEGORY_ID)
    expect(cat).toBeFalsy()
    expect(await helper.exists(image)).toBeFalsy()

    // test category not found
    res = await request(app)
      .delete(`/api/delete-category/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (id not valid)
    res = await request(app)
      .delete('/api/delete-category/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})
