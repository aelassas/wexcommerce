import 'dotenv/config'
import mongoose from 'mongoose'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import * as env from '../src/config/env.config'
import Order, { ORDER_EXPIRE_AT_INDEX_NAME } from '../src/models/Order'
import Token, { TOKEN_EXPIRE_AT_INDEX_NAME } from '../src/models/Token'
import Value from '../src/models/Value'

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  // testHelper.initializeLogger()

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

const createTokenIndex = async (expireAfterSeconds: number): Promise<void> => {
  await Token.collection.createIndex({ expireAt: 1 }, { name: TOKEN_EXPIRE_AT_INDEX_NAME, expireAfterSeconds, background: true })
}

const createOrderIndex = async (expireAfterSeconds: number): Promise<void> => {
  await Order.collection.createIndex({ expireAt: 1 }, { name: ORDER_EXPIRE_AT_INDEX_NAME, expireAfterSeconds, background: true })
}

const delay = async () => {
  await testHelper.delay(5 * 1000)
}

describe('Test database initialization', () => {
  it('should test database initialization', async () => {
    //
    // Test in case of no configuration change
    //
    let res = await databaseHelper.initialize()
    expect(res).toBeTruthy()
    await delay()

    //
    // Test in case of configuration change
    //
    const tokenIndexes = await Token.collection.indexes()
    const tokenIndex = tokenIndexes.find((index) => index.name === TOKEN_EXPIRE_AT_INDEX_NAME)
    expect(tokenIndex).toBeDefined()

    if (tokenIndex) {
      const { expireAfterSeconds } = tokenIndex
      await Token.collection.dropIndex(tokenIndex.name!)
      await createTokenIndex(expireAfterSeconds! + 1)
      await delay()
      res = await databaseHelper.initialize(false)
      expect(res).toBeTruthy()
      await delay()
    }

    const bookingIndexes = await Order.collection.indexes()
    const bookingIndex = bookingIndexes.find((index) => index.name === ORDER_EXPIRE_AT_INDEX_NAME)
    expect(bookingIndex).toBeDefined()

    if (bookingIndex) {
      const { expireAfterSeconds } = bookingIndex
      await Order.collection.dropIndex(bookingIndex.name!)
      await createOrderIndex(expireAfterSeconds! + 1)
      await delay()
      res = await databaseHelper.initialize(false)
      expect(res).toBeTruthy()
    }

    // test success (text index)
    const indexName = 'value_text'
    const opts = {
      name: indexName,
      default_language: 'en',
      language_override: '_none',
      background: true,
      weights: { ['value']: 1 },
    }
    await Value.collection.dropIndex(indexName)
    res = await databaseHelper.initialize()
    expect(res).toBeTruthy()
    await Value.collection.dropIndex(indexName)
    await Value.collection.createIndex({ ['value']: 'text' }, opts)
    res = await databaseHelper.initialize(false)
    expect(res).toBeTruthy()

    //
    // Test failure
    //
    try {
      await databaseHelper.close()
      res = await databaseHelper.initialize()
      expect(res).toBeFalsy()
    } catch (err) {
      console.error(err)
    } finally {
      res = await databaseHelper.connect(env.DB_URI, false, false)
      expect(res).toBeTruthy()
    }
  })
})
