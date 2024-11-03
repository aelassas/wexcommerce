import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as settingController from '../src/controllers/settingController'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import Setting from '../src/models/Setting'
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

describe('Initialize settings', () => {
  it('should initialize settings', async () => {
    // init
    const settings = await Setting.findOne().lean()
    await Setting.deleteMany()

    // test success
    let res = await settingController.init()
    expect(res).toBeTruthy()
    const count = await Setting.findOne().countDocuments()
    expect(count).toBe(1)

    // restore
    if (settings) {
      await new Setting({
        language: settings.language,
        currency: settings.currency,
        stripeCurrency: settings.stripeCurrency,
        bankName: settings.bankName,
        accountHolder: settings.accountHolder,
        rib: settings.rib,
        iban: settings.iban,
      }).save()
    }

    // test failure
    await databaseHelper.close()
    res = await settingController.init()
    expect(res).toBeFalsy()
    const connRes = await databaseHelper.connect(env.DB_URI, false, false)
    expect(connRes).toBeTruthy()
  })
})

describe('GET /api/language', () => {
  it('should get language', async () => {
    // test success
    let res = await request(app)
      .get('/api/language')
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()

    // test default value
    const settings = await Setting.findOne().lean()
    await Setting.deleteMany()
    res = await request(app)
      .get('/api/language')
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe(env.DEFAULT_LANGUAGE)

    if (settings) {
      await new Setting({
        language: settings.language,
        currency: settings.currency,
        stripeCurrency: settings.stripeCurrency,
        bankName: settings.bankName,
        accountHolder: settings.accountHolder,
        rib: settings.rib,
        iban: settings.iban,
      }).save()
    }

    // test failure
    await databaseHelper.close()
    res = await request(app)
      .get('/api/language')
    expect(res.statusCode).toBe(400)
    const connRes = await databaseHelper.connect(env.DB_URI, false, false)
    expect(connRes).toBeTruthy()
  })
})

describe('GET /api/currency', () => {
  it('should get currency', async () => {
    // test success
    let res = await request(app)
      .get('/api/currency')
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()

    // test default value
    const settings = await Setting.findOne().lean()
    await Setting.deleteMany()
    res = await request(app)
      .get('/api/currency')
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe(env.DEFAULT_CURRENCY)

    if (settings) {
      await new Setting({
        language: settings.language,
        currency: settings.currency,
        stripeCurrency: settings.stripeCurrency,
        bankName: settings.bankName,
        accountHolder: settings.accountHolder,
        rib: settings.rib,
        iban: settings.iban,
      }).save()
    }

    // test failure
    await databaseHelper.close()
    res = await request(app)
      .get('/api/currency')
    expect(res.statusCode).toBe(400)
    const connRes = await databaseHelper.connect(env.DB_URI, false, false)
    expect(connRes).toBeTruthy()
  })
})

describe('GET /api/stripe-currency', () => {
  it('should get stripe-currency', async () => {
    // test success
    let res = await request(app)
      .get('/api/stripe-currency')
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()

    // test default value
    const settings = await Setting.findOne().lean()
    await Setting.deleteMany()
    res = await request(app)
      .get('/api/stripe-currency')
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe(env.DEFAULT_STRIPE_CURRENCY)

    if (settings) {
      await new Setting({
        language: settings.language,
        currency: settings.currency,
        stripeCurrency: settings.stripeCurrency,
        bankName: settings.bankName,
        accountHolder: settings.accountHolder,
        rib: settings.rib,
        iban: settings.iban,
      }).save()
    }

    // test failure
    await databaseHelper.close()
    res = await request(app)
      .get('/api/stripe-currency')
    expect(res.statusCode).toBe(400)
    const connRes = await databaseHelper.connect(env.DB_URI, false, false)
    expect(connRes).toBeTruthy()
  })
})

describe('GET /api/settings', () => {
  it('should get enabled delivery types', async () => {
    const token = await testHelper.signinAsAdmin()

    const res = await request(app)
      .get('/api/settings')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()
  })
})

describe('PUT /api/update-settings', () => {
  it('should update settings', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const settings = await Setting.findOne()
    expect(settings).toBeTruthy()
    const { language, currency, stripeCurrency } = settings!

    // test success
    const payload: wexcommerceTypes.UpdateSettingsPayload = {
      language: 'fr',
      currency: '€',
      stripeCurrency: 'EUR',
    }

    let res = await request(app)
      .put('/api/update-settings')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    // restore
    settings!.language = language
    settings!.currency = currency
    settings!.stripeCurrency = stripeCurrency
    await settings!.save()

    // test not found
    const _settings = await Setting.findOne().lean()
    await Setting.deleteMany()
    res = await request(app)
      .put('/api/update-settings')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    if (_settings) {
      await new Setting({
        language: _settings.language,
        currency: _settings.currency,
        stripeCurrency: _settings.stripeCurrency,
        bankName: _settings.bankName,
        accountHolder: _settings.accountHolder,
        rib: _settings.rib,
        iban: _settings.iban,
      }).save()
    }
  })
})

describe('PUT /api/update-bank-settings', () => {
  it('should update bank settings', async () => {
    const token = await testHelper.signinAsAdmin()

    // init
    const settings = await Setting.findOne()
    expect(settings).toBeTruthy()
    const { bankName, accountHolder, rib, iban } = settings!

    // test success
    const payload: wexcommerceTypes.UpdateBankSettingsPayload = {
      bankName: 'BANK_NAME',
      accountHolder: 'ACCOUNT_HOLDER',
      rib: '007780000125300000000023',
      iban: 'GB007780000125300000000023',
    }

    let res = await request(app)
      .put('/api/update-bank-settings')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    // restore
    settings!.bankName = bankName
    settings!.accountHolder = accountHolder
    settings!.rib = rib
    settings!.iban = iban
    await settings!.save()

    // test not found
    const _settings = await Setting.findOne().lean()
    await Setting.deleteMany()
    res = await request(app)
      .put('/api/update-bank-settings')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    if (_settings) {
      await new Setting({
        language: _settings.language,
        currency: _settings.currency,
        stripeCurrency: _settings.stripeCurrency,
        bankName: _settings.bankName,
        accountHolder: _settings.accountHolder,
        rib: _settings.rib,
        iban: _settings.iban,
      }).save()
    }
  })
})
