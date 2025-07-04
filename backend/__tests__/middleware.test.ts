import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as databaseHelper from '../src/utils/databaseHelper'
import app from '../src/app'
import * as env from '../src/config/env.config'
import User from '../src/models/User'
import * as testHelper from './testHelper'

const { ADMIN_EMAIL } = testHelper
const { USER_EMAIL } = testHelper
let USER_ID: string

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  await databaseHelper.connect(env.DB_URI, false, false)
  
  await testHelper.initialize()
  USER_ID = testHelper.getUserId()
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

describe('POST /api/sign-in/admin', () => {
  it('should authenticate from admin', async () => {
    const payload: wexcommerceTypes.SignInPayload = {
      email: ADMIN_EMAIL,
      password: testHelper.PASSWORD,
    }

    let res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Admin}`)
      .send(payload)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Admin}`)
      .set('Origin', env.ADMIN_HOST)
      .send(payload)
    expect(res.statusCode).toBe(200)

    // Not allowed by CORS
    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Admin}`)
      .set('Origin', 'http://unknow/')
      .send(payload)
    expect(res.statusCode).toBe(500)
  })
})

describe('POST /api/sign-in/frontend', () => {
  it('should authenticate to frontend', async () => {
    const payload: wexcommerceTypes.SignInPayload = {
      email: USER_EMAIL,
      password: testHelper.PASSWORD,
    }

    let res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .send(payload)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .set('Origin', env.FRONTEND_HOST)
      .send(payload)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .send(payload)
    expect(res.statusCode).toBe(200)

    // Not allowed by CORS
    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .set('Origin', 'http://unknow/')
      .send(payload)
    expect(res.statusCode).toBe(500)
  })
})

describe('GET /api/user/:id', () => {
  it('should authenticate through request header', async () => {
    let token = await testHelper.signinAsAdmin()

    let res = await request(app)
      .get(`/api/user/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .set('Origin', env.ADMIN_HOST)
    expect(res.statusCode).toBe(200)
    expect(res.body.email).toBe(USER_EMAIL)

    token = await testHelper.signinAsUser()

    res = await request(app)
      .get(`/api/user/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .set('Origin', env.FRONTEND_HOST)
    expect(res.statusCode).toBe(200)
    expect(res.body.email).toBe(USER_EMAIL)

    // Token not found
    res = await request(app)
      .get(`/api/user/${USER_ID}`)
      .set('Origin', env.FRONTEND_HOST)
    expect(res.statusCode).toBe(403)

    // Token not valid
    res = await request(app)
      .get(`/api/user/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, 'unknown')
      .set('Origin', env.FRONTEND_HOST)
    expect(res.statusCode).toBe(401)

    // Token not valid: User not found
    const user = await User.findById(USER_ID)
    user!.blacklisted = true
    await user?.save()

    res = await request(app)
      .get(`/api/user/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .set('Origin', env.FRONTEND_HOST)
    expect(res.statusCode).toBe(401)

    user!.blacklisted = false
    await user?.save()
  })
})

describe('PATCH /api/user/:id', () => {
  it('should revoke access to PATCH method', async () => {
    const token = await testHelper.signinAsAdmin()

    const res = await request(app)
      .patch(`/api/user/${USER_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(405)
  })
})
