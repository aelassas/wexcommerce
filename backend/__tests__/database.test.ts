import 'dotenv/config'
import { jest } from '@jest/globals'
import type { Model } from 'mongoose'
import * as env from '../src/config/env.config'
import * as databaseHelper from '../src/utils/databaseHelper'
import * as databaseLangHelper from '../src/utils/databaseLangHelper'
import * as testHelper from './testHelper'
import Value from '../src/models/Value'
import Category from '../src/models/Category'

beforeAll(() => {
  // testHelper.initializeLogger()
})

describe('Test database connection', () => {
  it('should connect to database', async () => {
    // test success (connected)
    let res = await databaseHelper.connect(env.DB_URI, false, false)
    expect(res).toBeTruthy()
    // test success (already connected)
    res = await databaseHelper.connect(env.DB_URI, false, false)
    expect(res).toBeTruthy()
    await databaseHelper.close()
  })
})

describe('Test database initialization', () => {
  it('should initialize database', async () => {
    let res = await databaseHelper.connect(env.DB_URI, false, false)
    expect(res).toBeTruthy()

    const v1 = new Value({ language: 'en', value: 'category' })
    await v1.save()
    const v2 = new Value({ language: 'pt', value: 'categoria' })
    await v2.save()
    const c1 = new Category({ country: testHelper.GetRandromObjectIdAsString(), values: [v1.id, v2.id] })
    await c1.save()
    const c2 = new Category({ country: testHelper.GetRandromObjectIdAsString(), values: [v2.id] })
    await c2.save()

    // test batch deletion pf unsupported languages
    for (let i = 0; i < 1001; i++) {
      const lv2 = new Value({ language: 'pt', value: 'categoria' })
      await lv2.save()
    }

    res = await databaseHelper.initialize()
    expect(res).toBeTruthy()

    const category1 = await Category.findById(c1.id)
    const category2 = await Category.findById(c2.id)
    await Value.deleteMany({ _id: { $in: [...category1!.values, ...category2!.values] } })
    await category1?.deleteOne()
    await category2?.deleteOne()

    await databaseHelper.close()
  })
})

describe('Test database connection failure', () => {
  it('should fail connecting to database', async () => {
    const res = await databaseHelper.connect('wrong-uri', true, false)
    expect(res).toBeFalsy()
  })
})

describe('Test database initialization failures', () => {
  it('should check database initialization failures', async () => {
    // test failure (lost db connection)
    await databaseHelper.close()
    expect(await databaseLangHelper.initializeCategories()).toBeFalsy()
  })
})

describe('createCollection', () => {
  const modelName = 'TestCollection'

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('calls createCollection if collection does not exist', async () => {
    const model = {
      modelName,
      db: {
        listCollections: jest.fn(() => Promise.resolve([{ name: 'OtherCollection' }]))
      },
      createCollection: jest.fn(),
      createIndexes: jest.fn(),
    } as unknown as Model<any>

    await databaseHelper.createCollection(model)

    expect(model.createCollection).toHaveBeenCalled()
    expect(model.createIndexes).toHaveBeenCalled()
  })

  it('does NOT call createCollection if collection exists', async () => {
    const model = {
      modelName,
      db: {
        listCollections: jest.fn(() => Promise.resolve([{ name: modelName }]))
      },
      createCollection: jest.fn(),
      createIndexes: jest.fn(),
    } as unknown as Model<any>

    await databaseHelper.createCollection(model)

    expect(model.createCollection).not.toHaveBeenCalled()
    expect(model.createIndexes).toHaveBeenCalled()
  })

  it('does NOT create indexes if createIndexes is false', async () => {
    const model = {
      modelName,
      db: {
        listCollections: jest.fn(() => Promise.resolve([{ name: modelName }]))
      },
      createCollection: jest.fn(),
      createIndexes: jest.fn(),
    } as unknown as Model<any>

    await databaseHelper.createCollection(model, false)

    expect(model.createIndexes).not.toHaveBeenCalled()
  })
})

describe('createTextIndex', () => {
  it('logs error when an exception is thrown', async () => {
    const error = new Error('Test error')

    const collection = {
      indexes: jest.fn(() => Promise.reject(error)),
      dropIndex: jest.fn(),
      createIndex: jest.fn(),
    }

    const model = { collection } as any

    const logger = {
      info: jest.fn(),
      error: jest.fn(),
    }
    jest.unstable_mockModule('../src/utils/logger.js', () => logger)

    jest.resetModules()
    await jest.isolateModulesAsync(async () => {
      const dbh = await import('../src/utils/databaseHelper.js')
      await dbh.createTextIndex(model, 'myField', 'myIndex')

      expect(logger.error).toHaveBeenCalledWith('Failed to create text index:', error)
    })
  })
})

describe('checkAndUpdateTTL', () => {
  it('logs error when dropIndex throws', async () => {
    const name = 'ttlIndex'
    const seconds = 100
    const error = new Error('Drop failed')

    // Mock databaseTTLHelper
    const createTTLIndexMock = jest.fn(async () => { })

    jest.unstable_mockModule('../src/utils/databaseTTLHelper.js', () => ({
      createTTLIndex: createTTLIndexMock,
    }))

    // Mock logger module exports as jest.fn()
    const logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }
    jest.unstable_mockModule('../src/utils/logger.js', () => logger)

    jest.resetModules() // reset module cache

    await jest.isolateModulesAsync(async () => {
      // Import databaseHelper after mocking logger and databaseTTLHelper
      const { checkAndUpdateTTL } = await import('../src/utils/databaseHelper.js')

      // Prepare a model mock with dropIndex throwing error
      const model = {
        modelName: 'TestModel',
        collection: {
          indexes: jest.fn(() => Promise.resolve([
            { name, expireAfterSeconds: seconds - 1 }, // force existing = true
          ])),
          dropIndex: jest.fn(() => Promise.reject(error)), // triggers catch block
          createIndex: jest.fn(() => Promise.resolve({}))
        },
      } as any

      await checkAndUpdateTTL(model, name, seconds)

      expect(model.collection.dropIndex).toHaveBeenCalledWith(name)
      expect(logger.error).toHaveBeenCalledWith(
        `Failed to drop TTL index "${name}":`,
        error
      )
      expect(createTTLIndexMock).toHaveBeenCalledWith(model, name, seconds)
    })
  })
})

describe('initialize', () => {
  it('logs error when some routines fail', async () => {
    // Mock databaseLangHelper to simulate an error
    jest.unstable_mockModule('../src/utils/databaseLangHelper.js', () => ({
      initializeCategories: jest.fn(() => Promise.resolve(false)),
    }))

    // Mock logger module exports as jest.fn()
    const logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }
    jest.unstable_mockModule('../src/utils/logger.js', () => logger)

    jest.resetModules() // reset module cache

    await jest.isolateModulesAsync(async () => {
      // Import databaseHelper after mocking logger and databaseLangHelper
      const dbh = await import('../src/utils/databaseHelper.js')

      // test failure 
      const res = await dbh.connect(env.DB_URI, false, false)
      expect(res).toBeTruthy()
      await dbh.initialize()
      await dbh.close()

      expect(logger.error).toHaveBeenCalledWith('Some parts of the database failed to initialize')
    })
  })
})
