import 'dotenv/config'
import request from 'supertest'
import * as wexcommerceTypes from ':wexcommerce-types'
import app from '../src/app'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import * as env from '../src/config/env.config'
import Order from '../src/models/Order'
import DeliveryType from '../src/models/DeliveryType'
import PaymentType from '../src/models/PaymentType'

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  const res = await databaseHelper.connect(env.DB_URI, false, false)
  expect(res).toBeTruthy()
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
  await databaseHelper.close()
})

describe('POST /api/create-paypal-order', () => {
  it('should create paypal order', async () => {
    // test success (create paypal order whith non existant user)
    const payload: wexcommerceTypes.CreatePayPalOrderPayload = {
      amount: 234,
      currency: 'USD',
      name: 'Samsung A25',
      description: 'Samsung A25',
      orderId: testHelper.GetRandromObjectIdAsString(),
    }
    let res = await request(app)
      .post('/api/create-paypal-order')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)

    // test failure (create paypal order failure)
    payload.currency = 'xxxxxxxxxxxxxxx'
    res = await request(app)
      .post('/api/create-paypal-order')
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/check-paypal-order/:orderId/:orderId', () => {
  it('should check paypal order', async () => {
    // test failure (order exists, paypal order exists and payment failed)
    const expireAt = new Date()
    expireAt.setSeconds(expireAt.getSeconds() + env.ORDER_EXPIRE_AT)
    const from = new Date()
    from.setDate(from.getDate() + 1)
    const to = new Date(from)
    to.setDate(to.getDate() + 3)

    const order = new Order({
      user: testHelper.GetRandromObjectId(),
      deliveryType: (await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping }))?._id,
      paymentType: (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard }))?._id,
      total: 312,
      status: wexcommerceTypes.OrderStatus.Pending,
      orderItems: [testHelper.GetRandromObjectId()],
      expireAt,
    })
    try {
      await order.save()

      const payload: wexcommerceTypes.CreatePayPalOrderPayload = {
        amount: order.total,
        currency: 'USD',
        name: 'Samsung A25',
        description: 'Samsung A25',
        orderId: order.id,
      }
      let res = await request(app)
        .post('/api/create-paypal-order')
        .send(payload)
      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBeGreaterThan(0)
      const orderId = res.body

      res = await request(app)
        .post(`/api/check-paypal-order/${order.id}/${orderId}`)
      expect(res.statusCode).toBe(400)

      // test failure (order exists, paypal order does not exist)
      res = await request(app)
        .post(`/api/check-paypal-order/${order.id}/${testHelper.GetRandromObjectIdAsString()}`)
      expect(res.statusCode).toBe(204)
    } catch (err) {
      console.error(err)
    } finally {
      await order.deleteOne()
    }

    // test failure (order does not exist)
    let res = await request(app)
      .post(`/api/check-paypal-order/${testHelper.GetRandromObjectIdAsString()}/${testHelper.GetRandromObjectIdAsString()}`)
    expect(res.statusCode).toBe(204)

    // test failure (lost db connection)
    try {
      databaseHelper.close()
      res = await request(app)
        .post(`/api/check-paypal-order/${testHelper.GetRandromObjectIdAsString()}/${testHelper.GetRandromObjectIdAsString()}`)
      expect(res.statusCode).toBe(400)
    } catch (err) {
      console.error(err)
    } finally {
      const dbRes = await databaseHelper.connect(env.DB_URI, false, false)
      expect(dbRes).toBeTruthy()
    }
  })
})
