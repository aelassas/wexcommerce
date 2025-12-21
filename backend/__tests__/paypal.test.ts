import 'dotenv/config'
import { jest } from '@jest/globals'
import request from 'supertest'
import { nanoid } from 'nanoid'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as databaseHelper from '../src/utils/databaseHelper'
import * as testHelper from './testHelper'
import * as env from '../src/config/env.config'
import app from '../src/app'
import Order from '../src/models/Order'
import OrderItem from '../src/models/OrderItem'
import Product from '../src/models/Product'
import User from '../src/models/User'
import DeliveryType from '../src/models/DeliveryType'
import PaymentType from '../src/models/PaymentType'
import Notification from '../src/models/Notification'
import NotificationCounter from '../src/models/NotificationCounter'

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
  await databaseHelper.close()
})

describe('POST /api/create-paypal-order', () => {
  it('should create paypal order', async () => {
    jest.resetModules()

    await jest.unstable_mockModule('../src/payment/paypal.js', () => ({
      getOrder: jest.fn(),
      getToken: jest.fn(() => Promise.resolve('mock-token')),
      createOrder: jest.fn(() => Promise.resolve('ORDER-MOCK-123')),
    }))
    let paypal = await import('../src/payment/paypal.js')
    const orderId = await paypal.createOrder('order123', 100, 'USD', 'Test Name', 'Test Description', 'US')

    expect(orderId).toBe('ORDER-MOCK-123')
    expect(paypal.createOrder).toHaveBeenCalledWith(
      'order123',
      100,
      'USD',
      'Test Name',
      'Test Description',
      'US'
    )

    // test success (create paypal order whith non existant user)
    const payload: wexcommerceTypes.CreatePayPalOrderPayload = {
      amount: 234,
      currency: 'USD',
      name: 'BMW X1',
      description: 'BMW X1',
      orderId: testHelper.GetRandromObjectIdAsString(),
    }
    let res = await request(app)
      .post('/api/create-paypal-order')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)

    // test failure (create paypal order failure)
    jest.resetModules()

    await jest.unstable_mockModule('../src/payment/paypal.js', () => ({
      getOrder: jest.fn(),
      getToken: jest.fn(() => Promise.resolve('mock-token')),
      createOrder: jest.fn(() => Promise.reject(new Error('Simulated error'))),
    }))
    paypal = await import('../src/payment/paypal.js')
    await expect(paypal.createOrder('order123', 100, 'USD', 'Test Name', 'Test Description', 'US')).rejects.toThrow('Simulated error')

    payload.currency = 'xxxxxxxxxxxxxxx'
    res = await request(app)
      .post('/api/create-paypal-order')
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/check-paypal-order/:orderId/:orderId', () => {
  it('should check paypal order', async () => {
    // test failure (order exists, order exists and payment failed)
    const expireAt = new Date()
    expireAt.setSeconds(expireAt.getSeconds() + env.ORDER_EXPIRE_AT)

    const user = new User({
      fullName: 'user',
      email: testHelper.GetRandomEmail(),
      language: testHelper.LANGUAGE,
      type: wexcommerceTypes.UserType.User,
    })
    await user.save()

    const product = new Product({
      name: 'Product 1',
      description: 'Description',
      categories: [testHelper.GetRandromObjectIdAsString()],
      price: 10,
      quantity: 2,
    })
    await product.save()

    const orderItem = new OrderItem({ product: product._id.toString(), quantity: 1 })
    await orderItem.save()

    const orderItemProductMissing = new OrderItem({ product: testHelper.GetRandromObjectId(), quantity: 1 })
    await orderItemProductMissing.save()

    const deliveryType = (await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping }))?._id
    const paymentType = (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard }))?._id

    let order = new Order({
      user: user._id.toString(),
      deliveryType,
      paymentType,
      total: 312,
      status: wexcommerceTypes.OrderStatus.Pending,
      orderItems: [orderItem._id.toString()],
      expireAt,
    })
    let order2: typeof order | undefined
    let order3: typeof order | undefined
    try {
      await order.save()

      const orderId = nanoid()

      // test success
      jest.resetModules()
      await jest.unstable_mockModule('../src/payment/paypal.js', () => ({
        getOrder: jest.fn(() => Promise.resolve({ status: 'COMPLETED' })),
        getToken: jest.fn(() => Promise.resolve('fake-token')),
        createOrder: jest.fn(),
      }))

      let paypal = await import('../src/payment/paypal.js')

      await expect(paypal.getOrder('123')).resolves.toStrictEqual({ status: 'COMPLETED' })
      expect(paypal.getOrder).toHaveBeenCalledWith('123')

      let res = await request(app)
        .post(`/api/check-paypal-order/${order._id.toString()}/${orderId}`)
      expect(res.statusCode).toBe(200)
      await testHelper.deleteNotifications(order._id.toString())

      // test failure (settings not found)
      await order.deleteOne()
      order = new Order({
        user: user._id.toString(),
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItem._id.toString()],
        expireAt,
      })
      await order.save()

      await jest.isolateModulesAsync(async () => {
        const Setting = (await import('../src/models/Setting.js')).default
        jest.spyOn(Setting, 'findOne').mockResolvedValue(null)
        const env = await import('../src/config/env.config.js')
        const newApp = (await import('../src/app.js')).default
        const dbh = await import('../src/utils/databaseHelper.js')
        await dbh.connect(env.DB_URI, false, false)
        const res = await request(newApp)
          .post(`/api/check-paypal-order/${order._id.toString()}/${orderId}`)
        expect(res.statusCode).toBe(400)
        dbh.close()
      })

      jest.restoreAllMocks()
      jest.resetModules()

      // test failure (paypal order error)
      await order.deleteOne()
      order = new Order({
        user: user._id.toString(),
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItem._id.toString()],
        expireAt,
      })
      await order.save()
      jest.resetModules()
      await jest.unstable_mockModule('../src/payment/paypal.js', () => ({
        getOrder: jest.fn(() => Promise.reject(new Error('Simulated error'))),
        getToken: jest.fn(() => Promise.resolve('fake-token')),
        createOrder: jest.fn(),
      }))

      paypal = await import('../src/payment/paypal.js')

      await expect(paypal.getOrder('123')).rejects.toThrow('Simulated error')
      expect(paypal.getOrder).toHaveBeenCalledWith('123')

      res = await request(app)
        .post(`/api/check-paypal-order/${order._id.toString()}/${orderId}`)
      expect(res.statusCode).toBe(204)
      jest.resetModules()

      // test failure (order exists, order does not exist)
      res = await request(app)
        .post(`/api/check-paypal-order/${order._id.toString()}/${testHelper.GetRandromObjectIdAsString()}`)
      expect(res.statusCode).toBe(204)

      // test failure (payment expired)
      order2 = new Order({
        user: user._id.toString(),
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItem._id.toString()],
        expireAt,
      })
      await order2.save()
      jest.resetModules()
      await jest.unstable_mockModule('../src/payment/paypal.js', () => ({
        getOrder: jest.fn(() => Promise.resolve({ status: 'EXPIRED' })),
        getToken: jest.fn(() => Promise.resolve('fake-token')),
        createOrder: jest.fn(),
      }))

      paypal = await import('../src/payment/paypal.js')

      await expect(paypal.getOrder('123')).resolves.toStrictEqual({ status: 'EXPIRED' })
      expect(paypal.getOrder).toHaveBeenCalledWith('123')

      res = await request(app)
        .post(`/api/check-paypal-order/${order2._id.toString()}/${orderId}`)
      expect(res.statusCode).toBe(400)
      const b = await Order.findById(order2._id.toString())
      expect(b).toBeFalsy()
      order2 = undefined
      jest.resetModules()

      // test failure (missing members)
      order3 = new Order({
        user: user._id.toString(),
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItemProductMissing._id.toString()],
        expireAt,

      })
      await order3.save()
      jest.resetModules()
      await jest.unstable_mockModule('../src/payment/paypal.js', () => ({
        getOrder: jest.fn(() => Promise.resolve({ status: 'COMPLETED' })),
        getToken: jest.fn(() => Promise.resolve('fake-token')),
        createOrder: jest.fn(),
      }))

      paypal = await import('../src/payment/paypal.js')

      await expect(paypal.getOrder('123')).resolves.toStrictEqual({ status: 'COMPLETED' })
      expect(paypal.getOrder).toHaveBeenCalledWith('123')

      // product missing
      res = await request(app)
        .post(`/api/check-paypal-order/${order3._id.toString()}/${orderId}`)
      expect(res.statusCode).toBe(400)

      // user missing
      await order3.deleteOne()
      order3 = new Order({
        user: testHelper.GetRandromObjectId(),
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItem._id.toString()],
        expireAt,
      })
      await order3.save()
      res = await request(app)
        .post(`/api/check-paypal-order/${order3._id.toString()}/${orderId}`)
      expect(res.statusCode).toBe(400)
      jest.resetModules()
    } catch (err) {
      console.error(err)
      throw new Error(`Error during /api/check-paypal-order/: ${err}`)
    } finally {
      await orderItem.deleteOne()
      await orderItemProductMissing.deleteOne()
      await order.deleteOne()
      if (order2) {
        await order2.deleteOne()
      }
      if (order3) {
        await order3.deleteOne()
      }
      await product.deleteOne()
      await user.deleteOne()
      await Notification.deleteMany({ user: user._id.toString() })
      await NotificationCounter.deleteMany({ user: user._id.toString() })
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
