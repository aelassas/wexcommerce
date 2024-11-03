import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as paymentTypeController from '../src/controllers/paymentTypeController'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import PaymentType from '../src/models/PaymentType'
import app from '../src/app'
import * as env from '../src/config/env.config'

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

describe('Initialize paymentTypes', () => {
  it('should initialize paymentTypes', async () => {
    // test success
    let res = await paymentTypeController.init()
    expect(res).toBeTruthy()
    const creditCard = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard })
    expect(creditCard).not.toBeNull()
    const cod = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.Cod })
    expect(cod).not.toBeNull()
    const wireTransfer = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.WireTransfer })
    expect(wireTransfer).not.toBeNull()

    // test failure
    await databaseHelper.close()
    res = await paymentTypeController.init()
    expect(res).toBeFalsy()
    const connRes = await databaseHelper.connect(env.DB_URI, false, false)
    expect(connRes).toBeTruthy()
  })
})

describe('GET /api/payment-types', () => {
  it('should get all payment types', async () => {
    const token = await testHelper.signinAsAdmin()

    const res = await request(app)
      .get('/api/payment-types')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(3)
  })
})

describe('GET /api/enabled-payment-types', () => {
  it('should get enabled payment types', async () => {
    // init
    const creditCard = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard })
    expect(creditCard).not.toBeNull()
    const cod = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.Cod })
    expect(cod).not.toBeNull()
    const wireTransfer = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.WireTransfer })
    expect(wireTransfer).not.toBeNull()

    const creditCardEnabled = creditCard!.enabled
    creditCard!.enabled = true
    await creditCard!.save()
    const codEnabled = cod!.enabled
    cod!.enabled = true
    await cod!.save()
    const wireTransferEnabled = wireTransfer!.enabled
    wireTransfer!.enabled = true
    await wireTransfer!.save()

    // test success
    let res = await request(app)
      .get('/api/enabled-payment-types')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(3)

    // restore
    creditCard!.enabled = creditCardEnabled
    await creditCard!.save()
    cod!.enabled = codEnabled
    await cod!.save()
    wireTransfer!.enabled = wireTransferEnabled
    await wireTransfer!.save()

    // test failure
    await databaseHelper.close()
    res = await request(app)
      .get('/api/enabled-payment-types')
    expect(res.statusCode).toBe(400)
    const connRes = await databaseHelper.connect(env.DB_URI, false, false)
    expect(connRes).toBeTruthy()
  })
})

describe('PUT /api/update-payment-types', () => {
  it('should update payment types', async () => {
    const token = await testHelper.signinAsAdmin()
    // init
    let creditCard = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard })
    expect(creditCard).not.toBeNull()
    const creditCardEnabled = creditCard!.enabled
    let cod = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.Cod })
    expect(cod).not.toBeNull()
    const codEnabled = cod!.enabled

    // test success
    const payload: wexcommerceTypes.UpdatePaymentTypesPayload = [
      {
        _id: creditCard!.id,
        name: creditCard!.name,
        enabled: !creditCard!.enabled,
      },
      {
        _id: cod!.id,
        name: cod!.name,
        enabled: !cod!.enabled,
      },
    ]

    let res = await request(app)
      .put('/api/update-payment-types')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    creditCard = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard })
    expect(creditCard).not.toBeNull()
    expect(creditCard!.enabled).toBe(!creditCardEnabled)

    cod = await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.Cod })
    expect(cod).not.toBeNull()
    expect(cod!.enabled).toBe(!codEnabled)

    // restore
    creditCard!.enabled = creditCardEnabled
    await creditCard!.save()

    cod!.enabled = codEnabled
    await cod!.save()

    // test failure (payload not provided)
    res = await request(app)
      .put('/api/update-payment-types')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})
