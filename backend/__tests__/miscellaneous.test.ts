import 'dotenv/config'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as env from '../src/config/env.config'
import * as databaseHelper from '../src/utils/databaseHelper'
import * as mailHelper from '../src/utils/mailHelper'
import * as testHelper from './testHelper'
import User from '../src/models/User'

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

describe('Test User phone validation', () => {
  it('should test User phone validation', async () => {
    let res = true
    const USER: wexcommerceTypes.User = {
      email: testHelper.GetRandomEmail(),
      fullName: 'User 1',
      phone: '',
    }

    let userId = ''
    try {
      const user = new User(USER)
      await user.save()
      userId = user._id.toString()
      user.phone = 'unknown'
      await user.save()
    } catch {
      res = false
    } finally {
      if (userId) {
        await User.deleteOne({ _id: userId })
      }
    }
    expect(res).toBeFalsy()
  })
})

describe('Test email sending error', () => {
  it('should test email sending error', async () => {
    let res = true
    try {
      await mailHelper.sendMail({
        from: testHelper.GetRandomEmail(),
        to: 'wrong-email',
        subject: 'dummy subject',
        html: 'dummy body',
      })
    } catch {
      res = false
    }
    expect(res).toBeFalsy()
  })
})
