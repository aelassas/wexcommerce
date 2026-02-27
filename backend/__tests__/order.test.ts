import 'dotenv/config'
import { jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as databaseHelper from '../src/utils/databaseHelper'
import * as testHelper from './testHelper'
import app from '../src/app'
import * as env from '../src/config/env.config'
import stripeAPI from '../src/payment/stripe'
import Product from '../src/models/Product'
import OrderItem from '../src/models/OrderItem'
import Order from '../src/models/Order'
import DeliveryType from '../src/models/DeliveryType'
import PaymentType from '../src/models/PaymentType'
import User from '../src/models/User'
import Token from '../src/models/Token'
import Setting from '../src/models/Setting'
import * as orderController from '../src/controllers/orderController'
import Notification from '../src/models/Notification'
import NotificationCounter from '../src/models/NotificationCounter'

const CATEGORY_ID = testHelper.GetRandromObjectIdAsString()
let USER_ID: string
let ADMIN_ID: string
let PRODUCT_ID: string
let ORDER_ID: string
let TEMP_ORDER_ID: string
let SESSION_ID: string

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  await databaseHelper.connect(env.DB_URI, false, false)

  await testHelper.initialize()

  USER_ID = testHelper.getUserId()
  ADMIN_ID = testHelper.getAdminUserId()

  const product = new Product({
    name: 'Product',
    description: 'Description',
    categories: [CATEGORY_ID],
    price: 10,
    quantity: 2,
  })
  await product.save()
  PRODUCT_ID = product._id.toString()
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
  await testHelper.deleteNotifications(ORDER_ID)
  await Product.deleteOne({ _id: PRODUCT_ID })
  await testHelper.close()
  await databaseHelper.close()
})

//
// Unit tests
//

describe('POST /api/checkout', () => {
  it('should checkout', async () => {
    // init
    const product = await Product.findById(PRODUCT_ID)

    // test success (cod)
    const payload: wexcommerceTypes.CheckoutPayload = {
      order: {
        user: USER_ID,
        deliveryType: (await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Withdrawal }))!._id.toString(),
        paymentType: (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.Cod }))!._id.toString(),
        total: product!.price,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [{ product: PRODUCT_ID, quantity: 1 }],
      },
    }
    let res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.orderId).toBeTruthy()
    ORDER_ID = res.body.orderId
    await testHelper.deleteNotifications(ORDER_ID)

    // test failure (response error)
    jest.resetModules()
    await jest.isolateModulesAsync(async () => {
      const express = (await import('express')).default
      jest.spyOn(express.response, 'send').mockImplementation(() => {
        throw new Error('Simulate Mock Error')
      })
      const env = await import('../src/config/env.config.js')
      const newApp = (await import('../src/app.js')).default
      const dbh = await import('../src/utils/databaseHelper.js')
      await dbh.connect(env.DB_URI, false, false)
      res = await request(newApp)
        .post('/api/checkout')
        .send(payload)
      expect(res.statusCode).toBe(400)
      await dbh.close()
    })
    jest.restoreAllMocks()
    jest.resetModules()

    // test failure (settings not found)
    jest.resetModules()
    await jest.isolateModulesAsync(async () => {
      const Setting = (await import('../src/models/Setting.js')).default
      jest.spyOn(Setting, 'findOne').mockResolvedValue(null)
      const newApp = (await import('../src/app.js')).default
      res = await request(newApp)
        .post('/api/checkout')
        .send(payload)
      expect(res.statusCode).toBe(400)
    })
    jest.restoreAllMocks()
    jest.resetModules()

    // test success (new user)
    payload.order.user = undefined
    payload.user = {
      fullName: 'User',
      email: testHelper.GetRandomEmail(),
    }
    res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.orderId).toBeTruthy()
    let order = await Order.findById(res.body.orderId)
    await testHelper.deleteNotifications(order!._id.toString())
    await OrderItem.deleteMany({ _id: { $in: order!.orderItems as mongoose.Types.ObjectId[] } })
    await order!.deleteOne()
    const user = await User.findOne({ email: payload.user.email })
    expect(user).toBeTruthy()
    await Token.deleteMany({ user: user!._id.toString() })
    await user!.deleteOne()

    // test success (Shipping, WireTransfer)
    payload.order.user = USER_ID
    payload.user = undefined
    payload.order.deliveryType = (await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping }))!._id.toString()
    payload.order.paymentType = (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.WireTransfer }))!._id.toString()
    res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.orderId).toBeTruthy()
    order = await Order.findById(res.body.orderId)
    await testHelper.deleteNotifications(order!._id.toString())
    await OrderItem.deleteMany({ _id: { $in: order!.orderItems as mongoose.Types.ObjectId[] } })
    await order!.deleteOne()

    // test success (stripe with no payment intent)
    const crediCardPaymentType = (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard }))!._id.toString()
    payload.order.paymentType = crediCardPaymentType
    payload.paymentIntentId = undefined
    SESSION_ID = testHelper.GetRandromObjectIdAsString()
    payload.sessionId = SESSION_ID
    res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.orderId).toBeTruthy()
    TEMP_ORDER_ID = res.body.orderId
    await testHelper.deleteNotifications(TEMP_ORDER_ID)

    // test failure (stripe with payment intent)
    const receiptEmail = testHelper.GetRandomEmail()
    const paymentIntentPayload: wexcommerceTypes.CreatePaymentPayload = {
      amount: 234,
      currency: 'usd',
      receiptEmail,
      customerName: 'John Doe',
      description: 'wexCommerce Testing Service',
      locale: 'en',
      name: 'Test',
    }
    res = await request(app)
      .post('/api/create-payment-intent')
      .send(paymentIntentPayload)
    expect(res.statusCode).toBe(200)
    expect(res.body.paymentIntentId).not.toBeNull()
    expect(res.body.customerId).not.toBeNull()
    const { paymentIntentId, customerId } = res.body
    payload.paymentIntentId = paymentIntentId
    payload.customerId = customerId
    res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test success (stripe with payment intent)
    await stripeAPI.paymentIntents.confirm(paymentIntentId, {
      payment_method: 'pm_card_visa',
    })
    res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.orderId).toBeTruthy()
    order = await Order.findById(res.body.orderId)
    await testHelper.deleteNotifications(order!._id.toString())
    await OrderItem.deleteMany({ _id: { $in: order!.orderItems as mongoose.Types.ObjectId[] } })
    await order!.deleteOne()
    const customer = await stripeAPI.customers.retrieve(customerId)
    if (customer) {
      await stripeAPI.customers.del(customerId)
    }
    payload.paymentIntentId = undefined

    // test success (stripe and user verified)
    await User.updateOne({ _id: USER_ID }, { verified: true })
    res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.orderId).toBeTruthy()
    order = await Order.findById(res.body.orderId)
    await testHelper.deleteNotifications(order!._id.toString())
    await OrderItem.deleteMany({ _id: { $in: order!.orderItems as mongoose.Types.ObjectId[] } })
    await order!.deleteOne()

    // test failure (user not found)
    payload.order.user = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (no payment intent and no session)
    payload.order.user = USER_ID
    payload.sessionId = undefined
    res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (stripe payment failed)
    payload.paymentIntentId = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post('/api/checkout')
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (settings not found)
    jest.resetModules()
    await jest.isolateModulesAsync(async () => {
      const Setting = (await import('../src/models/Setting.js')).default
      jest.spyOn(Setting, 'findOne').mockResolvedValue(null)
      const newApp = (await import('../src/app.js')).default
      res = await request(newApp)
        .post('/api/checkout')
        .send(payload)
      expect(res.statusCode).toBe(400)
    })
    jest.restoreAllMocks()
    jest.resetModules()
  })
})

describe('PUT /api/update-order/:user/:id', () => {
  it('should update order status', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    const payload: wexcommerceTypes.UpdateOrderPayload = {
      status: wexcommerceTypes.OrderStatus.Shipped,
    }
    let res = await request(app)
      .put(`/api/update-order/${ADMIN_ID}/${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect((await Order.findById(ORDER_ID))!.status).toBe(wexcommerceTypes.OrderStatus.Shipped)

    // test success (no admin notification counter)
    const admin = new User({
      fullName: 'admin',
      email: testHelper.GetRandomEmail(),
      language: testHelper.LANGUAGE,
      password: 'xxxxxxxxxxxxxxxx',
      type: wexcommerceTypes.UserType.Admin,
    })
    await admin.save()
    payload.status = wexcommerceTypes.OrderStatus.Cancelled
    res = await request(app)
      .put(`/api/update-order/${admin._id.toString()}/${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect((await Order.findById(ORDER_ID))!.status).toBe(wexcommerceTypes.OrderStatus.Cancelled)
    await Notification.deleteMany({ user: admin._id.toString() })
    await NotificationCounter.deleteMany({ user: admin._id.toString() })
    await admin.deleteOne()

    // test failure (user not found)
    res = await request(app)
      .put(`/api/update-order/${testHelper.GetRandromObjectIdAsString()}/${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (settings not found)
    jest.resetModules()
    await jest.isolateModulesAsync(async () => {
      const Setting = (await import('../src/models/Setting.js')).default
      jest.spyOn(Setting, 'findOne').mockResolvedValue(null)
      const env = await import('../src/config/env.config.js')
      const newApp = (await import('../src/app.js')).default
      const dbh = await import('../src/utils/databaseHelper.js')
      await dbh.connect(env.DB_URI, false, false)
      res = await request(newApp)
        .put(`/api/update-order/${ADMIN_ID}/${ORDER_ID}`)
        .set(env.X_ACCESS_TOKEN, token)
        .send(payload)
      expect(res.statusCode).toBe(400)
      await dbh.close()
    })
    jest.restoreAllMocks()
    jest.resetModules()

    // test order not found
    res = await request(app)
      .put(`/api/update-order/${ADMIN_ID}/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    // test failure (user id not valid)
    res = await request(app)
      .put(`/api/update-order/0/${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // test failure (order id not valid)
    res = await request(app)
      .put(`/api/update-order/${ADMIN_ID}/0`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/order/:id', () => {
  it('should get an order', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .get(`/api/order/${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body._id).toBeTruthy()

    // test order not found
    res = await request(app)
      .get(`/api/order/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure (order id not valid)
    res = await request(app)
      .get('/api/order/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/orders/:user/:page/:size', () => {
  it('should get orders', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success with admin
    const payload: wexcommerceTypes.GetOrdersPayload = {
      paymentTypes: [wexcommerceTypes.PaymentType.Cod],
      deliveryTypes: [wexcommerceTypes.DeliveryType.Withdrawal],
      statuses: [wexcommerceTypes.OrderStatus.Cancelled],
      sortBy: wexcommerceTypes.SortOrderBy.dateDesc,
      from: null,
      to: null,
    }

    let res = await request(app)
      .post(`/api/orders/${ADMIN_ID}/1/10`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body[0].resultData.length).toBeGreaterThanOrEqual(1)

    // test success with keyword
    res = await request(app)
      .post(`/api/orders/${ADMIN_ID}/1/10/?s=${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body[0].resultData.length).toBeGreaterThanOrEqual(1)

    // test success with user
    payload.sortBy = wexcommerceTypes.SortOrderBy.dateAsc
    res = await request(app)
      .post(`/api/orders/${USER_ID}/1/10/?s=${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body[0].resultData.length).toBeGreaterThanOrEqual(1)

    // test success with user (no sortBy)
    payload.sortBy = undefined
    res = await request(app)
      .post(`/api/orders/${USER_ID}/1/10/?s=${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body[0].resultData.length).toBeGreaterThanOrEqual(1)

    // test success (from and to)
    const from = new Date()
    from.setDate(from.getDate() - 1)
    const to = new Date()
    to.setDate(to.getDate() + 1)
    payload.from = from.getTime()
    payload.to = to.getTime()
    res = await request(app)
      .post(`/api/orders/${ADMIN_ID}/1/10?s=product`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body[0].resultData.length).toBeGreaterThanOrEqual(1)

    // test success with no content
    payload.sortBy = undefined
    const randomOrderId = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post(`/api/orders/${USER_ID}/1/10/?s=${randomOrderId}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body[0].resultData.length).toBe(0)

    // // test failure (user id not valid)
    // res = await request(app)
    //   .post('/api/orders/0/1/10')
    //   .set(env.X_ACCESS_TOKEN, token)
    //   .send(payload)
    // expect(res.statusCode).toBe(400)

    // // test failure (user not found)
    // res = await request(app)
    //   .post(`/api/orders/${testHelper.GetRandromObjectIdAsString()}/1/10`)
    //   .set(env.X_ACCESS_TOKEN, token)
    //   .send(payload)
    // expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/delete-order/:user/:id', () => {
  it('should delete an order', async () => {
    const token = await testHelper.signinAsAdmin()

    // test success
    let res = await request(app)
      .delete(`/api/delete-order/${ADMIN_ID}/${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    // test order not found
    res = await request(app)
      .delete(`/api/delete-order/${ADMIN_ID}/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // test failure user not found
    res = await request(app)
      .delete(`/api/delete-order/${testHelper.GetRandromObjectIdAsString()}/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // test failure (user id not valid)
    res = await request(app)
      .delete(`/api/delete-order/0/${ORDER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    // test failure (order id not valid)
    res = await request(app)
      .delete(`/api/delete-order/${ADMIN_ID}/0`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/delete-temp-order/:orderId/:sessionId', () => {
  it('should delete a temp order', async () => {
    // test success
    let res = await request(app)
      .delete(`/api/delete-temp-order/${TEMP_ORDER_ID}/${SESSION_ID}`)
    expect(res.statusCode).toBe(200)
    expect(await Order.findById(TEMP_ORDER_ID)).toBeFalsy()

    // test order not found
    res = await request(app)
      .delete(`/api/delete-temp-order/${testHelper.GetRandromObjectIdAsString()}/${SESSION_ID}`)
    expect(res.statusCode).toBe(200)

    // test failure (order id not valid)
    res = await request(app)
      .delete(`/api/delete-temp-order/0/${SESSION_ID}`)
    expect(res.statusCode).toBe(400)
  })
})

describe('notify', () => {
  it('should test notify', async () => {
    const deliveryType = (await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping }))?._id
    const paymentType = (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard }))?._id
    const user = await User.findById(testHelper.getUserId())
    expect(user).not.toBeNull()
    const order = new Order({
      user: user!._id.toString(),
      deliveryType,
      paymentType,
      total: 312,
      status: wexcommerceTypes.OrderStatus.Pending,
      orderItems: [testHelper.GetRandromObjectId()],
    })
    const settings = await Setting.findOne({})
    expect(settings).not.toBeNull()

    // test success (no email)
    let res = true
    try {
      await orderController.notify('', order, user!, settings!)
    } catch {
      res = false
    }
    await testHelper.deleteNotifications(order._id.toString())
    expect(res).toBeTruthy()

    // test success (no admin notification counter)
    const admin = new User({
      fullName: 'admin',
      email: testHelper.GetRandomEmail(),
      language: testHelper.LANGUAGE,
      password: 'xxxxxxxxxxxxxxxx',
      type: wexcommerceTypes.UserType.Admin,
    })
    await admin.save()
    try {
      await orderController.notify(admin.email, order, user!, settings!)
    } catch {
      res = false
    }
    await Notification.deleteMany({ user: admin._id.toString() })
    await NotificationCounter.deleteMany({ user: admin._id.toString() })
    await admin.deleteOne()
    expect(res).toBeTruthy()
  })
})
