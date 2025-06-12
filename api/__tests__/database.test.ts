import 'dotenv/config'
import * as env from '../src/config/env.config'
import * as databaseHelper from '../src/common/databaseHelper'
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
