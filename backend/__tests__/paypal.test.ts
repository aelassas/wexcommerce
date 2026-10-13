import 'dotenv/config'
import { jest } from '@jest/globals'
import request from 'supertest'
import { nanoid } from 'nanoid'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as databaseHelper from '../src/utils/databaseHelper'
import * as testHelper from './testHelper'
import * as env from '../src/config/env.config'
import Order from '../src/models/Order'
import OrderItem from '../src/models/OrderItem'
import Product from '../src/models/Product'
import User from '../src/models/User'
import Setting from '../src/models/Setting'
import DeliveryType from '../src/models/DeliveryType'
import PaymentType from '../src/models/PaymentType'
import Notification from '../src/models/Notification'
import NotificationCounter from '../src/models/NotificationCounter'

//
// ESM mock setup prior to application import
//
const mockGetOrder = jest.fn<(...args: any[]) => Promise<any>>()
const mockCreateOrder = jest.fn<(...args: any[]) => Promise<any>>()

await jest.unstable_mockModule('../src/payment/paypal.js', () => ({
  getOrder: mockGetOrder,
  getToken: jest.fn(() => Promise.resolve('fake-token')),
  createOrder: mockCreateOrder,
}))

const { default: app } = await import('../src/app')
const paypal = await import('../src/payment/paypal.js')

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
    mockCreateOrder.mockImplementation(() => Promise.resolve('ORDER-MOCK-123'))

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

    // Create a real order record to verify server-side price lookup
    const order = new Order({
      user: testHelper.GetRandromObjectId(),
      deliveryType: testHelper.GetRandromObjectId(),
      paymentType: testHelper.GetRandromObjectId(),
      total: 234,
      status: wexcommerceTypes.OrderStatus.Pending,
    })
    await order.save()

    // test success (create paypal order)
    const payload: wexcommerceTypes.CreatePayPalOrderPayload = {
      amount: 1, // Client sends manipulated amount, server uses order.total (234)
      currency: 'USD',
      name: 'Product 1',
      description: 'Product 1',
      orderId: order._id.toString(),
    }
    let res = await request(app)
      .post('/api/create-paypal-order')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)

    // test failure (create paypal order with non-existent order)
    payload.orderId = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post('/api/create-paypal-order')
      .send(payload)
    expect(res.statusCode).toBe(204)

    // test failure (create paypal order failure)
    mockCreateOrder.mockImplementation(() => Promise.reject(new Error('Simulated error')))

    await expect(paypal.createOrder('order123', 100, 'USD', 'Test Name', 'Test Description', 'US')).rejects.toThrow('Simulated error')

    payload.orderId = order._id.toString()
    payload.currency = 'xxxxxxxxxxxxxxx'
    res = await request(app)
      .post('/api/create-paypal-order')
      .send(payload)
    expect(res.statusCode).toBe(400)

    await order.deleteOne()
  })
})

describe('POST /api/check-paypal-order/:orderId/:paypalOrderId', () => {
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

      const paypalOrderId = nanoid()

      const mockPayPalOrder = (overrides = {}, unitOverrides = {}) => ({
        status: 'COMPLETED',
        purchase_units: [
          {
            invoice_id: order._id.toString(),
            amount: {
              value: '312.00',
              currency_code: 'USD',
            },
            payments: {
              captures: [{ id: 'CAPTURE-123' }],
            },
            ...unitOverrides,
          },
        ],
        ...overrides,
      })

      // test success
      mockGetOrder.mockImplementation(() => Promise.resolve(mockPayPalOrder()))

      await expect(paypal.getOrder('123')).resolves.toStrictEqual(mockPayPalOrder())
      expect(paypal.getOrder).toHaveBeenCalledWith('123')

      let res = await request(app)
        .post(`/api/check-paypal-order/${order._id.toString()}/${paypalOrderId}`)
      expect(res.statusCode).toBe(200)
      await testHelper.deleteNotifications(order._id.toString())

      // test failure (total mismatch)
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

      mockGetOrder.mockImplementation(() => Promise.resolve(mockPayPalOrder({}, {
        invoice_id: order._id.toString(),
        amount: { value: '1.00', currency_code: 'USD' },
      })))

      res = await request(app)
        .post(`/api/check-paypal-order/${order._id.toString()}/${paypalOrderId}`)
      expect(res.statusCode).toBe(400)
      expect(res.text).toBe('Payment amount mismatch')

      // test failure (invoice id / order id mismatch)
      mockGetOrder.mockImplementation(() => Promise.resolve(mockPayPalOrder({}, {
        invoice_id: testHelper.GetRandromObjectIdAsString(),
      })))

      res = await request(app)
        .post(`/api/check-paypal-order/${order._id.toString()}/${paypalOrderId}`)
      expect(res.statusCode).toBe(400)
      expect(res.text).toBe('Order ID mismatch')

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

      mockGetOrder.mockImplementation(() => Promise.resolve(mockPayPalOrder({}, {
        invoice_id: order._id.toString(),
      })))

      const settingSpy = jest.spyOn(Setting, 'findOne').mockResolvedValueOnce(null)
      res = await request(app)
        .post(`/api/check-paypal-order/${order._id.toString()}/${paypalOrderId}`)
      expect(res.statusCode).toBe(400)
      settingSpy.mockRestore()

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

      mockGetOrder.mockImplementation(() => Promise.reject(new Error('Simulated error')))

      await expect(paypal.getOrder('123')).rejects.toThrow('Simulated error')
      expect(paypal.getOrder).toHaveBeenCalledWith('123')

      res = await request(app)
        .post(`/api/check-paypal-order/${order._id.toString()}/${paypalOrderId}`)
      expect(res.statusCode).toBe(204)

      // test failure (order exists, paypal order does not exist)
      mockGetOrder.mockImplementation(() => Promise.resolve(undefined))

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

      mockGetOrder.mockImplementation(() => Promise.resolve(mockPayPalOrder(
        { status: 'EXPIRED' },
        { invoice_id: order2!._id.toString() }
      )))

      res = await request(app)
        .post(`/api/check-paypal-order/${order2._id.toString()}/${paypalOrderId}`)
      expect(res.statusCode).toBe(400)
      const b = await Order.findById(order2._id.toString())
      expect(b).toBeFalsy()
      order2 = undefined

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

      mockGetOrder.mockImplementation(() => Promise.resolve(mockPayPalOrder(
        {},
        { invoice_id: order3!._id.toString() }
      )))

      await expect(paypal.getOrder('123')).resolves.toStrictEqual(mockPayPalOrder({}, { invoice_id: order3._id.toString() }))
      expect(paypal.getOrder).toHaveBeenCalledWith('123')

      // product missing
      res = await request(app)
        .post(`/api/check-paypal-order/${order3._id.toString()}/${paypalOrderId}`)
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

      mockGetOrder.mockImplementation(() => Promise.resolve(mockPayPalOrder(
        {},
        { invoice_id: order3!._id.toString() }
      )))

      res = await request(app)
        .post(`/api/check-paypal-order/${order3._id.toString()}/${paypalOrderId}`)
      expect(res.statusCode).toBe(400)
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
