import 'dotenv/config'
import { jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as deliveryTypeController from '../src/controllers/deliveryTypeController'
import * as databaseHelper from '../src/utils/databaseHelper'
import * as testHelper from './testHelper'
import DeliveryType from '../src/models/DeliveryType'
import app from '../src/app'
import * as env from '../src/config/env.config'

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  await databaseHelper.connect(env.DB_URI, false, false)

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

describe('Initialize deliveryTypes', () => {
  it('should initialize deliveryTypes', async () => {
    // test success
    let res = await deliveryTypeController.init()
    expect(res).toBeTruthy()
    const shipping = await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping })
    expect(shipping).not.toBeNull()
    const withdrawal = await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Withdrawal })
    expect(withdrawal).not.toBeNull()

    // test failure
    await databaseHelper.close()
    res = await deliveryTypeController.init()
    expect(res).toBeFalsy()
    const connRes = await databaseHelper.connect(env.DB_URI, false, false)
    expect(connRes).toBeTruthy()

    // test success (delivery type not found)
    jest.resetModules()
    await jest.isolateModulesAsync(async () => {
      const DeliveryType = (await import('../src/models/DeliveryType.js')).default
      jest.spyOn(DeliveryType, 'findOne').mockResolvedValue(null)
      jest.spyOn(DeliveryType.prototype, 'save').mockResolvedValue({ _id: 'mock-id', name: 'Mock DeliveryType', enabled: true })
      const env = await import('../src/config/env.config.js')
      const dbh = await import('../src/utils/databaseHelper.js')
      const pc = await import('../src/controllers/deliveryTypeController.js')
      await dbh.connect(env.DB_URI, false, false)
      res = await pc.init()
      expect(res).toBeTruthy()
      await dbh.close()
    })
    jest.clearAllMocks()
    jest.resetModules()
  })
})

describe('GET /api/delivery-types', () => {
  it('should get all delivery types', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .get('/api/delivery-types')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(2)

    // test failure (delivery type not found)
    jest.resetModules()
    await jest.unstable_mockModule('../src/models/DeliveryType.js', () => ({
      default: {
        find: jest.fn(() => ({
          sort: jest.fn(() => Promise.reject(new Error('DB error'))),
        })),
      }
    }))
    await jest.isolateModulesAsync(async () => {
      const env = await import('../src/config/env.config.js')
      const dbh = await import('../src/utils/databaseHelper.js')
      const newApp = (await import('../src/app.js')).default
      await dbh.connect(env.DB_URI, false, false)
      res = await request(newApp)
        .get('/api/delivery-types')
        .set(env.X_ACCESS_TOKEN, token)
      expect(res.statusCode).toBe(400)
      await dbh.close()
    })
  })
})

describe('GET /api/enabled-delivery-types', () => {
  it('should get enabled delivery types', async () => {
    // init
    const shipping = await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping })
    expect(shipping).not.toBeNull()
    const withdrawal = await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Withdrawal })
    expect(withdrawal).not.toBeNull()
    const shippingEnabled = shipping!.enabled
    shipping!.enabled = true
    await shipping!.save()
    const withdrawalEnabled = withdrawal!.enabled
    withdrawal!.enabled = true
    await withdrawal!.save()

    // test success
    let res = await request(app)
      .get('/api/enabled-delivery-types')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(2)

    // restore
    shipping!.enabled = shippingEnabled
    await shipping!.save()
    withdrawal!.enabled = withdrawalEnabled
    await withdrawal!.save()

    // test failure
    await databaseHelper.close()
    res = await request(app)
      .get('/api/enabled-delivery-types')
    expect(res.statusCode).toBe(400)
    const connRes = await databaseHelper.connect(env.DB_URI, false, false)
    expect(connRes).toBeTruthy()
  })
})

describe('PUT /api/update-delivery-types', () => {
  it('should update delivery types', async () => {
    const token = await testHelper.signinAsAdmin()
    // init
    let shipping = await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping })
    expect(shipping).not.toBeNull()
    const shippingEnabled = shipping!.enabled
    const shippingPrice = shipping!.price
    let withdrawal = await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Withdrawal })
    expect(withdrawal).not.toBeNull()
    const withdrawalEnabled = withdrawal!.enabled
    const withdrawalPrice = withdrawal!.price

    // test success
    const payload: wexcommerceTypes.UpdateDeliveryTypesPayload = [
      {
        _id: shipping!.id,
        name: shipping!.name,
        enabled: !shipping!.enabled,
        price: shipping!.price + 5,
      },
      {
        _id: withdrawal!.id,
        name: withdrawal!.name,
        enabled: !withdrawal!.enabled,
        price: withdrawal!.price + 5,
      },
    ]

    let res = await request(app)
      .put('/api/update-delivery-types')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    shipping = await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping })
    expect(shipping).not.toBeNull()
    expect(shipping!.enabled).toBe(!shippingEnabled)
    expect(shipping!.price).toBe(shippingPrice + 5)

    withdrawal = await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Withdrawal })
    expect(withdrawal).not.toBeNull()
    expect(withdrawal!.enabled).toBe(!withdrawalEnabled)
    expect(withdrawal!.price).toBe(withdrawalPrice + 5)

    // success (delivery type not found)
    const dtName = payload[0]!.name
    payload[0].name = 'xxxxxxxxxxx' as wexcommerceTypes.DeliveryType
    res = await request(app)
      .put('/api/update-delivery-types')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    payload[0].name = dtName

    // restore
    shipping!.enabled = shippingEnabled
    shipping!.price = shippingPrice
    await shipping!.save()

    withdrawal!.enabled = withdrawalEnabled
    withdrawal!.price = withdrawalPrice
    await withdrawal!.save()

    // test failure (payload not provided)
    res = await request(app)
      .put('/api/update-delivery-types')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})
