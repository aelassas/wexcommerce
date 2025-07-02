import 'dotenv/config'
import { jest } from '@jest/globals'
import request from 'supertest'
import { nanoid } from 'nanoid'
import * as wexcommerceTypes from ':wexcommerce-types'
import app from '../src/app'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import * as env from '../src/config/env.config'
import Order from '../src/models/Order'
import OrderItem from '../src/models/OrderItem'
import Product from '../src/models/Product'
import User from '../src/models/User'
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
  await databaseHelper.close()
})

describe('POST /api/create-checkout-session', () => {
  it('should create checkout session', async () => {
    jest.resetModules()
    await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
      default: {
        customers: {
          list: jest.fn(() =>
            Promise.resolve({
              data: [{ id: 'cus_123', email: receiptEmail }],
            })
          ),
          create: jest.fn(() =>
            Promise.resolve({
              id: 'cus_new_456',
              email: 'new@example.com',
              name: 'John Doe',
            })
          ),
        },
        checkout: {
          sessions: {
            create: jest.fn(() =>
              Promise.resolve({
                id: 'cs_test_123',
                status: 'open',
                url: 'https://mocked-stripe-session.com',
                client_secret: nanoid(),
              })
            ),
          },
        },
      },
    }))
    let stripeAPI = (await import('../src/payment/stripe.js')).default

    let session = await stripeAPI.checkout.sessions.create({})

    expect(session.id).toBe('cs_test_123')
    expect(stripeAPI.checkout.sessions.create).toHaveBeenCalled()

    // test success (create checkout session with non existant user)
    let receiptEmail = testHelper.GetRandomEmail()
    let payload: wexcommerceTypes.CreatePaymentPayload = {
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

    // test success (create checkout session with existant user)
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
      // const customers = await stripeAPI.customers.list({ email: receiptEmail })
      // if (customers.data.length > 0) {
      //   for (const customer of customers.data) {
      //     await stripeAPI.customers.del(customer.id)
      //   }
      // }
    }

    // test success (create new user)
    jest.resetModules()
    await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
      default: {
        customers: {
          list: jest.fn(() =>
            Promise.resolve({
              data: [],
            })
          ),
          create: jest.fn(() =>
            Promise.resolve({
              id: 'cus_new_456',
              email: 'new@example.com',
              name: 'John Doe',
            })
          ),
        },
        checkout: {
          sessions: {
            create: jest.fn(() =>
              Promise.resolve({
                id: 'cs_test_123',
                status: 'open',
                url: 'https://mocked-stripe-session.com',
                client_secret: nanoid(),
              })
            ),
          },
        },
      },
    }))
    stripeAPI = (await import('../src/payment/stripe.js')).default

    session = await stripeAPI.checkout.sessions.create({})

    expect(session.id).toBe('cs_test_123')
    expect(stripeAPI.checkout.sessions.create).toHaveBeenCalled()

    // test success (create checkout session with non existant user)
    receiptEmail = testHelper.GetRandomEmail()
    res = await request(app)
      .post('/api/create-checkout-session')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.sessionId).not.toBeNull()
    expect(res.body.customerId).not.toBeNull()

    // test failure (create checkout sessions failure)
    jest.resetModules()
    await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
      default: {
        customers: {
          list: jest.fn(() =>
            Promise.reject(new Error('Stripe error'))
          ),
          create: jest.fn(() =>
            Promise.resolve({
              id: 'cus_new_456',
              email: 'new@example.com',
              name: 'John Doe',
            })
          ),
        },
        checkout: {
          sessions: {
            create: jest.fn(() =>
              Promise.resolve({
                id: 'cs_test_123',
                status: 'open',
                url: 'https://mocked-stripe-session.com',
                client_secret: nanoid(),
              })
            ),
          },
        },
      },
    }))
    stripeAPI = (await import('../src/payment/stripe.js')).default
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
    // test failure (checkout session does not exist)
    let res = await request(app)
      .post('/api/check-checkout-session/xxxxxxxxxx')
    expect(res.statusCode).toBe(204)

    // test failure (checkout session exists but order does not exist)
    const sessionId = nanoid()
    res = await request(app)
      .post(`/api/check-checkout-session/${sessionId}`)
    expect(res.statusCode).toBe(204)

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

    const orderItem = new OrderItem({ product: product.id, quantity: 1 })
    await orderItem.save()

    const orderItemProductMissing = new OrderItem({ product: testHelper.GetRandromObjectId(), quantity: 1 })
    await orderItemProductMissing.save()

    const deliveryType = (await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping }))?._id
    const paymentType = (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard }))?._id

    let order = new Order({
      user: user.id,
      deliveryType,
      paymentType,
      total: 312,
      status: wexcommerceTypes.OrderStatus.Pending,
      orderItems: [orderItem.id],
      expireAt,
      sessionId,
    })
    let order2: typeof order | undefined
    let order3: typeof order | undefined
    try {
      await order.save()

      // test success
      jest.resetModules()
      await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
        default: {
          checkout: {
            sessions: {
              retrieve: jest.fn(() => Promise.resolve({ payment_status: 'paid' })),
            },
          },
        },
      }))

      let stripeAPI = (await import('../src/payment/stripe.js')).default

      await expect(stripeAPI.checkout.sessions.retrieve('123')).resolves.toStrictEqual({ payment_status: 'paid' })
      expect(stripeAPI.checkout.sessions.retrieve).toHaveBeenCalledWith('123')

      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId}`)
      expect(res.statusCode).toBe(200)

      // test failure (settings not found)
      await order.deleteOne()
      order = new Order({
        user: user.id,
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItem.id],
        expireAt,
        sessionId,
      })
      await order.save()

      await jest.isolateModulesAsync(async () => {
        const Setting = (await import('../src/models/Setting.js')).default
        jest.spyOn(Setting, 'findOne').mockResolvedValue(null)
        const env = await import('../src/config/env.config.js')
        const newApp = (await import('../src/app.js')).default
        const dbh = await import('../src/common/databaseHelper.js')
        await dbh.connect(env.DB_URI, false, false)
        const res = await request(newApp)
          .post(`/api/check-checkout-session/${sessionId}`)
        expect(res.statusCode).toBe(400)
        dbh.close()
      })

      jest.restoreAllMocks()
      jest.resetModules()

      // test failure (order not found)
      res = await request(app)
        .post(`/api/check-checkout-session/${nanoid()}`)
      expect(res.statusCode).toBe(204)

      // test failure (stripe order error)
      await order.deleteOne()
      order = new Order({
        user: user.id,
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItem.id],
        expireAt,
        sessionId,
      })
      await order.save()
      jest.resetModules()
      await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
        default: {
          checkout: {
            sessions: {
              retrieve: jest.fn(() => Promise.reject(new Error('Simulated error'))),
            },
          },
        },
      }))

      stripeAPI = (await import('../src/payment/stripe.js')).default

      await expect(stripeAPI.checkout.sessions.retrieve('123')).rejects.toThrow('Simulated error')
      expect(stripeAPI.checkout.sessions.retrieve).toHaveBeenCalledWith('123')

      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId}`)
      expect(res.statusCode).toBe(204)
      jest.resetModules()

      // test failure (order exists, stripe order does not)
      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId}`)
      expect(res.statusCode).toBe(204)

      // test failure (payment canceled)
      // res = await request(app)
      //   .post('/api/create-checkout-session')
      //   .send(payload)
      // expect(res.statusCode).toBe(200)
      // const { sessionId: sessionId2 } = res.body
      const sessionId2 = nanoid()
      order2 = new Order({
        user: user.id,
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItem.id],
        expireAt,
        sessionId: sessionId2,
      })
      await order2.save()
      jest.resetModules()
      await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
        default: {
          checkout: {
            sessions: {
              retrieve: jest.fn(() => Promise.resolve({ payment_status: 'canceled' })),
            },
          },
        },
      }))

      stripeAPI = (await import('../src/payment/stripe.js')).default

      await expect(stripeAPI.checkout.sessions.retrieve('123')).resolves.toStrictEqual({ payment_status: 'canceled' })
      expect(stripeAPI.checkout.sessions.retrieve).toHaveBeenCalledWith('123')

      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId2}`)
      expect(res.statusCode).toBe(400)
      const b = await Order.findById(order2.id)
      expect(b).toBeFalsy()
      order2 = undefined
      jest.resetModules()

      // test failure (missing members)
      jest.resetModules()
      await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
        default: {
          checkout: {
            sessions: {
              retrieve: jest.fn(() => Promise.resolve({ payment_status: 'paid' })),
            },
          },
        },
      }))

      stripeAPI = (await import('../src/payment/stripe.js')).default

      await expect(stripeAPI.checkout.sessions.retrieve('123')).resolves.toStrictEqual({ payment_status: 'paid' })
      expect(stripeAPI.checkout.sessions.retrieve).toHaveBeenCalledWith('123')

      // product missing
      const sessionId3 = nanoid()
      order3 = new Order({
        user: user.id,
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItemProductMissing.id],
        expireAt,
        sessionId: sessionId3,
      })
      await order3.save()
      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId3}`)
      expect(res.statusCode).toBe(400)

      // user missing
      await order3.deleteOne()
      order3 = new Order({
        user: testHelper.GetRandromObjectId(),
        deliveryType,
        paymentType,
        total: 312,
        status: wexcommerceTypes.OrderStatus.Pending,
        orderItems: [orderItem.id],
        expireAt,
        sessionId: sessionId3,
      })
      await order3.save()
      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId3}`)
      expect(res.statusCode).toBe(400)

      jest.resetModules()
    } catch (err) {
      console.error(err)
      throw new Error(`Error during /api/check-checkout-session/: ${err}`)
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
    }

    // test failure (lost db connection)
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
    jest.resetModules()
    const receiptEmail = testHelper.GetRandomEmail()
    await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
      default: {
        customers: {
          list: jest.fn(() =>
            Promise.resolve({
              data: [{ id: 'cus_123', email: receiptEmail }],
            })
          ),
          create: jest.fn(() =>
            Promise.resolve({
              id: 'cus_new_456',
              email: 'new@example.com',
              name: 'John Doe',
            })
          ),
        },
        paymentIntents: {
          create: jest.fn(() =>
            Promise.resolve({
              id: 'pi_123456',
              status: 'succeeded',
              clientSecret: nanoid(),
            })
          ),
        },
      },
    }))
    let stripeAPI = (await import('../src/payment/stripe.js')).default

    let customer = await stripeAPI.customers.create({
      email: 'new@example.com',
      name: 'John Doe',
    })

    expect(customer.id).toBe('cus_new_456')
    expect(stripeAPI.customers.create).toHaveBeenCalled()

    //
    // Test create payment intent with non existant user
    //
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
    // Test create payment intent with existant user
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
      // const customers = await stripeAPI.customers.list({ email: receiptEmail })
      // if (customers.data.length > 0) {
      //   for (const customer of customers.data) {
      //     await stripeAPI.customers.del(customer.id)
      //   }
      // }
    }

    //
    // Test success (create user)
    //
    jest.resetModules()
    await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
      default: {
        customers: {
          list: jest.fn(() =>
            Promise.resolve({
              data: [],
            })
          ),
          create: jest.fn(() =>
            Promise.resolve({
              id: 'cus_new_456',
              email: 'new@example.com',
              name: 'John Doe',
            })
          ),
        },
        paymentIntents: {
          create: jest.fn(() =>
            Promise.resolve({
              id: 'pi_123456',
              status: 'succeeded',
              clientSecret: nanoid(),
            })
          ),
        },
      },
    }))
    stripeAPI = (await import('../src/payment/stripe.js')).default

    customer = await stripeAPI.customers.create({
      email: 'new@example.com',
      name: 'John Doe',
    })

    expect(customer.id).toBe('cus_new_456')
    expect(stripeAPI.customers.create).toHaveBeenCalled()
    res = await request(app)
      .post('/api/create-payment-intent')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.paymentIntentId).not.toBeNull()
    expect(res.body.customerId).not.toBeNull()

    //
    // Test create payment intent failure
    //
    jest.resetModules()
    await jest.unstable_mockModule('../src/payment/stripe.js', () => ({
      default: {
        customers: {
          list: jest.fn(() =>
            Promise.reject(new Error('Stripe Error'))
          ),
          create: jest.fn(() =>
            Promise.resolve({
              id: 'cus_new_456',
              email: 'new@example.com',
              name: 'John Doe',
            })
          ),
        },
        paymentIntents: {
          create: jest.fn(() =>
            Promise.resolve({
              id: 'pi_123456',
              status: 'succeeded',
              clientSecret: nanoid(),
            })
          ),
        },
      },
    }))
    stripeAPI = (await import('../src/payment/stripe.js')).default

    payload.receiptEmail = 'xxxxxxxxxxxxxxx'
    res = await request(app)
      .post('/api/create-payment-intent')
      .send(payload)
    expect(res.statusCode).toBe(400)
    expect(res.body).toStrictEqual({})
  })
})
