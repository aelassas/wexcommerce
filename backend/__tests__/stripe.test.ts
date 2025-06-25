import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import app from '../src/app'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import stripeAPI from '../src/payment/stripe'
import * as env from '../src/config/env.config'
import Order from '../src/models/Order'
import DeliveryType from '../src/models/DeliveryType'
import PaymentType from '../src/models/PaymentType'

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  await databaseHelper.connect(env.DB_URI, false, false)
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
  if (mongoose.connection.readyState) {
    await databaseHelper.close()
  }
})

describe('POST /api/create-checkout-session', () => {
  it('should create checkout session', async () => {
    //
    // Test create checkout session whith non existant user
    //
    const receiptEmail = testHelper.GetRandomEmail()
    const payload: wexcommerceTypes.CreatePaymentPayload = {
      amount: 234,
      currency: 'usd',
      receiptEmail,
      customerName: 'John Doe',
      locale: 'en',
      name: 'BMW X1',
      description: 'wexCommerce Testing Service',
    }
    let res = await request(app)
      .post('/api/create-checkout-session')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.sessionId).not.toBeNull()
    expect(res.body.customerId).not.toBeNull()

    //
    // Test create checkout session whith existant user
    //
    try {
      res = await request(app)
        .post('/api/create-checkout-session')
        .send(payload)
      expect(res.statusCode).toBe(200)
      expect(res.body.sessionId).not.toBeNull()
      expect(res.body.customerId).not.toBeNull()
    } catch (err) {
      console.error(err)
    } finally {
      const customers = await stripeAPI.customers.list({ email: receiptEmail })
      if (customers.data.length > 0) {
        for (const customer of customers.data) {
          await stripeAPI.customers.del(customer.id)
        }
      }
    }

    //
    // Test create checkout sessions failure
    //
    payload.receiptEmail = 'xxxxxxxxxxxxxxx'
    res = await request(app)
      .post('/api/create-checkout-session')
      .send(payload)
    expect(res.statusCode).toBe(400)
    expect(res.body).toStrictEqual({})
  })
})

describe('POST /api/check-checkout-session/:sessionId', () => {
  it('should check checkout session', async () => {
    //
    // Checkout session does not exist
    //
    let res = await request(app)
      .post('/api/check-checkout-session/xxxxxxxxxx')
    expect(res.statusCode).toBe(204)

    //
    // Checkout session exists but booking does not exist
    //
    const receiptEmail = testHelper.GetRandomEmail()
    const payload: wexcommerceTypes.CreatePaymentPayload = {
      amount: 234,
      currency: 'usd',
      receiptEmail,
      customerName: 'John Doe',
      locale: 'en',
      name: 'Samsung A34',
      description: 'wexCommerce Testing Service',
    }
    res = await request(app)
      .post('/api/create-checkout-session')
      .send(payload)
    expect(res.statusCode).toBe(200)
    const { sessionId } = res.body
    expect(sessionId).not.toBeNull()
    expect(res.body.customerId).not.toBeNull()
    res = await request(app)
      .post(`/api/check-checkout-session/${sessionId}`)
    expect(res.statusCode).toBe(204)

    //
    // Checkout session exists and booking exists and payment failed
    //
    const expireAt = new Date()
    expireAt.setSeconds(expireAt.getSeconds() + env.ORDER_EXPIRE_AT)

    const order = new Order({
      user: testHelper.GetRandromObjectId(),
      deliveryType: (await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping }))?._id,
      paymentType: (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard }))?._id,
      total: 312,
      status: wexcommerceTypes.OrderStatus.Pending,
      orderItems: [testHelper.GetRandromObjectId()],
      expireAt,
      sessionId,
    })
    try {
      await order.save()

      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId}`)
      expect(res.statusCode).toBe(400)
    } catch (err) {
      console.error(err)
    } finally {
      await order.deleteOne()
    }

    //
    // Test database failure
    //
    try {
      databaseHelper.close()
      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId}`)
      expect(res.statusCode).toBe(400)
    } catch (err) {
      console.error(err)
    } finally {
      const dbRes = await databaseHelper.connect(env.DB_URI, false, false)
      expect(dbRes).toBeTruthy()
    }
  })
})

describe('POST /api/create-payment-intent', () => {
  it('should create payment intents', async () => {
    //
    // Test create payment intent whith non existant user
    //
    const receiptEmail = testHelper.GetRandomEmail()
    const payload: wexcommerceTypes.CreatePaymentPayload = {
      amount: 234,
      currency: 'usd',
      receiptEmail,
      customerName: 'John Doe',
      locale: 'en',
      name: 'wexCommerce Testing Service',
      description: '',
    }
    let res = await request(app)
      .post('/api/create-payment-intent')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.paymentIntentId).not.toBeNull()
    expect(res.body.customerId).not.toBeNull()

    //
    // Test create payment intent whith existant user
    //
    try {
      res = await request(app)
        .post('/api/create-payment-intent')
        .send(payload)
      expect(res.statusCode).toBe(200)
      expect(res.body.paymentIntentId).not.toBeNull()
      expect(res.body.customerId).not.toBeNull()
    } catch (err) {
      console.error(err)
    } finally {
      const customers = await stripeAPI.customers.list({ email: receiptEmail })
      if (customers.data.length > 0) {
        for (const customer of customers.data) {
          await stripeAPI.customers.del(customer.id)
        }
      }
    }

    //
    // Test create payment intent failure
    //
    payload.receiptEmail = 'xxxxxxxxxxxxxxx'
    res = await request(app)
      .post('/api/create-payment-intent')
      .send(payload)
    expect(res.statusCode).toBe(400)
    expect(res.body).toStrictEqual({})
  })
})
