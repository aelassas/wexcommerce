import 'dotenv/config'
import request from 'supertest'
import url from 'url'
import path from 'path'
import fs from 'node:fs/promises'
import { nanoid } from 'nanoid'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import app from '../src/app'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import * as env from '../src/config/env.config'
import User from '../src/models/User'
import Token from '../src/models/Token'
import Order from '../src/models/Order'
import * as helper from '../src/common/helper'
import DeliveryType from '../src/models/DeliveryType'
import PaymentType from '../src/models/PaymentType'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const AVATAR1 = 'avatar1.jpg'
const AVATAR1_PATH = path.resolve(__dirname, `./img/${AVATAR1}`)
const AVATAR2 = 'avatar2.png'
const AVATAR2_PATH = path.resolve(__dirname, `./img/${AVATAR2}`)

let USER1_ID: string
let ADMIN_ID: string

const USER1_EMAIL = `${testHelper.getName('user1')}@test.wexcommerce.com`
const USER1_PASSWORD = testHelper.PASSWORD
const ADMIN_EMAIL = `${testHelper.getName('admin')}@test.wexcommerce.com`

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

    await Token.deleteMany({ user: { $in: [ADMIN_ID] } })

    await databaseHelper.close()
  }
})

//
// Unit tests
//

describe('POST /api/sign-up', () => {
  it('should create a user', async () => {
    const tempAvatar = path.join(env.CDN_TEMP_USERS, AVATAR1)
    if (!await helper.exists(tempAvatar)) {
      await fs.copyFile(AVATAR1_PATH, tempAvatar)
    }

    const payload: wexcommerceTypes.SignUpPayload = {
      email: USER1_EMAIL,
      password: USER1_PASSWORD,
      fullName: 'user1',
      language: testHelper.LANGUAGE,

      phone: '09090909',
      avatar: AVATAR1,
    }
    let res = await request(app)
      .post('/api/sign-up')
      .send(payload)
    expect(res.statusCode).toBe(200)
    let user = await User.findOne({ email: USER1_EMAIL })
    expect(user).not.toBeNull()
    USER1_ID = user?.id
    expect(user?.type).toBe(wexcommerceTypes.UserType.User)
    expect(user?.email).toBe(payload.email)
    expect(user?.fullName).toBe(payload.fullName)
    expect(user?.language).toBe(payload.language)

    expect(user?.phone).toBe(payload.phone)
    let token = await Token.findOne({ user: USER1_ID })
    expect(token).not.toBeNull()
    expect(token?.token.length).toBeGreaterThan(0)

    const email = testHelper.GetRandomEmail()
    payload.email = email
    payload.avatar = `${nanoid()}.jpg`
    res = await request(app)
      .post('/api/sign-up')
      .send(payload)
    expect(res.statusCode).toBe(200)
    user = await User.findOne({ email })
    expect(user).not.toBeNull()
    await user!.deleteOne()
    token = await Token.findOne({ user: user!.id })
    expect(token).not.toBeNull()
    expect(token!.token.length).toBeGreaterThan(0)
    await token!.deleteOne()

    res = await request(app)
      .post('/api/sign-up')
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/admin-sign-up', () => {
  it('should create an admin user', async () => {
    const payload: wexcommerceTypes.SignUpPayload = {
      email: ADMIN_EMAIL,
      password: testHelper.PASSWORD,
      fullName: 'admin',
      language: testHelper.LANGUAGE,
      phone: '09090909',
    }

    const res = await request(app)
      .post('/api/admin-sign-up')
      .send(payload)
    expect(res.statusCode).toBe(200)

    const user = await User.findOne({ email: ADMIN_EMAIL })
    expect(user).not.toBeNull()
    ADMIN_ID = user?.id
    expect(user?.type).toBe(wexcommerceTypes.UserType.Admin)
    expect(user?.email).toBe(payload.email)
    expect(user?.fullName).toBe(payload.fullName)
    expect(user?.language).toBe(payload.language)

    expect(user?.phone).toBe(payload.phone)
    const token = await Token.findOne({ user: ADMIN_ID })
    expect(token).not.toBeNull()
    expect(token?.token.length).toBeGreaterThan(0)
  })
})

describe('GET /api/check-token/:type/:userId/:email/:token', () => {
  it("should check user's token", async () => {
    const user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    user!.active = false
    await user!.save()
    const userToken = await Token.findOne({ user: USER1_ID })
    expect(userToken).not.toBeNull()
    const token = userToken?.token
    expect(token?.length).toBeGreaterThan(1)

    let res = await request(app)
      .get(`/api/check-token/${wexcommerceTypes.AppType.Frontend}/${USER1_ID}/${USER1_EMAIL}/${token}`)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .get(`/api/check-token/${wexcommerceTypes.AppType.Backend}/${USER1_ID}/${USER1_EMAIL}/${token}`)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .get(`/api/check-token/${wexcommerceTypes.AppType.Frontend}/${testHelper.GetRandromObjectIdAsString()}/${USER1_EMAIL}/${token}`)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .get(`/api/check-token/${wexcommerceTypes.AppType.Frontend}/${USER1_ID}/${USER1_EMAIL}/${nanoid()}`)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .get(`/api/check-token/${wexcommerceTypes.AppType.Frontend}/0/${USER1_EMAIL}/${token}`)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/activate', () => {
  it("should activate user's account", async () => {
    const userToken = await Token.findOne({ user: USER1_ID })
    expect(userToken).not.toBeNull()
    const token = userToken?.token
    expect(token?.length).toBeGreaterThan(1)

    const payload: wexcommerceTypes.ActivatePayload = {
      userId: USER1_ID,
      password: testHelper.PASSWORD,
      token: token!,
    }
    let res = await request(app)
      .post('/api/activate')
      .send(payload)
    expect(res.statusCode).toBe(200)
    const user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    expect(user?.active).toBeTruthy()
    expect(user?.verified).toBeTruthy()

    payload.userId = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post('/api/activate')
      .send(payload)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .post('/api/activate')
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/confirm-email/:email/:token', () => {
  it('should send confirmation email', async () => {
    let user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    user!.verified = false
    await user?.save()
    const userToken = await Token.findOne({ user: USER1_ID })
    expect(userToken).not.toBeNull()
    const token = userToken?.token
    expect(token?.length).toBeGreaterThan(1)
    let res = await request(app)
      .get(`/api/confirm-email/${USER1_EMAIL}/${token}`)
    expect(res.statusCode).toBe(200)

    user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    expect(user?.verified).toBeTruthy()
    res = await request(app)
      .get(`/api/confirm-email/${USER1_EMAIL}/${token}`)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .get(`/api/confirm-email/${testHelper.GetRandomEmail()}/${token}`)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .get(`/api/confirm-email/${USER1_EMAIL}/${nanoid()}`)
    expect(res.statusCode).toBe(400)

    res = await request(app)
      .get(`/api/confirm-email/unknown/${nanoid()}`)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/resend/:type/:email/:reset', () => {
  it('should resend validation email', async () => {
    let user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    user!.active = true
    await user!.save()
    let reset = true
    let res = await request(app)
      .post(`/api/resend/${wexcommerceTypes.AppType.Frontend}/${USER1_EMAIL}/${reset}`)
    expect(res.statusCode).toBe(200)
    user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    expect(user?.active).toBeFalsy()

    reset = false
    res = await request(app)
      .post(`/api/resend/${wexcommerceTypes.AppType.Backend}/${ADMIN_EMAIL}/${reset}`)
    expect(res.statusCode).toBe(200)
    user = await User.findById(ADMIN_ID)
    expect(user).not.toBeNull()
    expect(user?.active).toBeFalsy()

    res = await request(app)
      .post(`/api/resend/${wexcommerceTypes.AppType.Backend}/${USER1_EMAIL}/${reset}`)
    expect(res.statusCode).toBe(403)

    res = await request(app)
      .post(`/api/resend/${wexcommerceTypes.AppType.Frontend}/${testHelper.GetRandomEmail()}/${reset}`)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .post(`/api/resend/${wexcommerceTypes.AppType.Frontend}/unknown/${reset}`)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/resend-link', () => {
  it('should resend activation link', async () => {
    const token = await testHelper.signinAsAdmin()

    const payload: wexcommerceTypes.ResendLinkPayload = {
      email: USER1_EMAIL,
    }

    let res = await request(app)
      .post('/api/resend-link')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    const user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    user!.verified = true
    await user?.save()
    res = await request(app)
      .post('/api/resend-link')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    payload.email = testHelper.GetRandomEmail()
    res = await request(app)
      .post('/api/resend-link')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    payload.email = USER1_EMAIL
    user!.verified = false
    await user?.save()
    res = await request(app)
      .post('/api/resend-link')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    payload.email = 'unknown'
    res = await request(app)
      .post('/api/resend-link')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('DELETE /api/delete-tokens/:userId', () => {
  it("should delete user's tokens", async () => {
    let userTokens = await Token.find({ user: USER1_ID })
    expect(userTokens.length).toBeGreaterThan(0)
    let res = await request(app)
      .delete(`/api/delete-tokens/${USER1_ID}`)
    expect(res.statusCode).toBe(200)
    userTokens = await Token.find({ user: USER1_ID })
    expect(userTokens.length).toBe(0)

    res = await request(app)
      .delete(`/api/delete-tokens/${USER1_ID}`)
    expect(res.statusCode).toBe(400)

    res = await request(app)
      .delete('/api/delete-tokens/0')
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/sign-in/:type', () => {
  it('should sign in', async () => {
    const payload: wexcommerceTypes.SignInPayload = {
      email: USER1_EMAIL,
      password: USER1_PASSWORD,
    }

    let res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.accessToken).toBeDefined()

    payload.email = undefined
    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .send(payload)
    expect(res.statusCode).toBe(400)
    payload.email = USER1_EMAIL

    payload.password = 'wrong-password'
    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .send(payload)
    expect(res.statusCode).toBe(204)

    payload.password = USER1_PASSWORD
    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Backend}`)
      .send(payload)
    expect(res.statusCode).toBe(204)

    payload.stayConnected = true
    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .send(payload)
    expect(res.statusCode).toBe(200)

    payload.stayConnected = false
    payload.mobile = true
    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .send(payload)
    expect(res.statusCode).toBe(200)

    payload.email = 'unknown'
    res = await request(app)
      .post(`/api/sign-in/${wexcommerceTypes.AppType.Frontend}`)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/social-sign-in/:type', () => {
  it('should sign in', async () => {
    const payload: wexcommerceTypes.SignInPayload = {
      email: USER1_EMAIL,
      socialSignInType: wexcommerceTypes.SocialSignInType.Google,
      accessToken: testHelper.GetRandromObjectIdAsString(),
    }

    let res = await request(app)
      .post('/api/social-sign-in')
      .send(payload)
    expect(res.statusCode).toBe(400)

    payload.socialSignInType = wexcommerceTypes.SocialSignInType.Facebook
    res = await request(app)
      .post('/api/social-sign-in')
      .send(payload)
    expect(res.statusCode).toBe(400)

    payload.socialSignInType = wexcommerceTypes.SocialSignInType.Apple
    res = await request(app)
      .post('/api/social-sign-in')
      .send(payload)
    expect(res.statusCode).toBe(400)

    payload.email = undefined
    res = await request(app)
      .post('/api/social-sign-in')
      .send(payload)
    expect(res.statusCode).toBe(400)

    payload.email = 'not-valid-email'
    res = await request(app)
      .post('/api/social-sign-in')
      .send(payload)
    expect(res.statusCode).toBe(400)
    payload.email = USER1_EMAIL

    payload.socialSignInType = undefined
    res = await request(app)
      .post('/api/social-sign-in')
      .send(payload)
    expect(res.statusCode).toBe(400)
    payload.socialSignInType = wexcommerceTypes.SocialSignInType.Google

    payload.accessToken = undefined
    res = await request(app)
      .post('/api/social-sign-in')
      .send(payload)
    expect(res.statusCode).toBe(400)
    payload.accessToken = testHelper.GetRandromObjectIdAsString()

    res = await request(app)
      .post('/api/social-sign-in')
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/validate-email', () => {
  it('should validate email', async () => {
    const payload: wexcommerceTypes.ValidateEmailPayload = {
      email: USER1_EMAIL,
    }
    let res = await request(app)
      .post('/api/validate-email')
      .send(payload)
    expect(res.statusCode).toBe(204)

    payload.email = testHelper.GetRandomEmail()
    res = await request(app)
      .post('/api/validate-email')
      .send(payload)
    expect(res.statusCode).toBe(200)

    payload.email = 'unkown'
    res = await request(app)
      .post('/api/validate-email')
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/validate-access-token', () => {
  it('should validate access token', async () => {
    const token = await testHelper.signinAsAdmin()

    let res = await request(app)
      .post('/api/validate-access-token')
      .set(env.X_ACCESS_TOKEN, token)

    expect(res.statusCode).toBe(200)

    res = await request(app)
      .post('/api/validate-access-token')
      .set(env.X_ACCESS_TOKEN, nanoid())

    expect(res.statusCode).toBe(401)

    res = await request(app)
      .post('/api/validate-access-token')

    expect(res.statusCode).toBe(403)
  })
})

describe('POST /api/update-user', () => {
  it('should update user', async () => {
    const token = await testHelper.signinAsAdmin()

    const payload: wexcommerceTypes.UpdateUserPayload = {
      _id: USER1_ID,
      fullName: 'user1-1',
      phone: '09090908',
      address: 'address1-1',
    }
    let res = await request(app)
      .post('/api/update-user')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    const user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    expect(user?.type).toBe(wexcommerceTypes.UserType.User)
    expect(user?.fullName).toBe(payload.fullName)

    expect(user?.phone).toBe(payload.phone)
    expect(user?.address).toBe(payload.address)

    payload._id = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post('/api/update-user')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    payload._id = '0'
    res = await request(app)
      .post('/api/update-user')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/update-language', () => {
  it("should update user's language", async () => {
    const token = await testHelper.signinAsAdmin()

    let user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    expect(user?.language).toBe(testHelper.LANGUAGE)
    const payload: wexcommerceTypes.UpdateLanguagePayload = {
      id: USER1_ID,
      language: 'fr',
    }
    let res = await request(app)
      .post('/api/update-language')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    expect(user?.language).toBe(payload.language)

    payload.id = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post('/api/update-language')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    payload.id = '0'
    res = await request(app)
      .post('/api/update-language')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/user/:id', () => {
  it('should get a user', async () => {
    const token = await testHelper.signinAsAdmin()

    let res = await request(app)
      .get(`/api/user/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body.email).toBe(USER1_EMAIL)

    res = await request(app)
      .get(`/api/user/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .get('/api/user/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/create-avatar', () => {
  it("should create user's avatar", async () => {
    const token = await testHelper.signinAsAdmin()

    let res = await request(app)
      .post('/api/create-avatar')
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', AVATAR1_PATH)
    expect(res.statusCode).toBe(200)
    const filename = res.body as string
    const filePath = path.resolve(env.CDN_TEMP_USERS, filename)
    const avatarExists = await helper.exists(filePath)
    expect(avatarExists).toBeTruthy()
    await fs.unlink(filePath)

    res = await request(app)
      .post('/api/create-avatar')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/update-avatar/:userId', () => {
  it("should update user's avatar", async () => {
    const token = await testHelper.signinAsAdmin()

    let res = await request(app)
      .post(`/api/update-avatar/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', AVATAR2_PATH)
    expect(res.statusCode).toBe(200)
    const filename = res.body as string
    let avatarExists = await helper.exists(path.resolve(env.CDN_USERS, filename))
    expect(avatarExists).toBeTruthy()
    const user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    expect(user?.avatar).toBeDefined()
    expect(user?.avatar).not.toBeNull()

    user!.avatar = `${nanoid()}.jpg`
    await user?.save()
    res = await request(app)
      .post(`/api/update-avatar/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', AVATAR2_PATH)
    expect(res.statusCode).toBe(200)
    avatarExists = await helper.exists(path.resolve(env.CDN_USERS, filename))
    expect(avatarExists).toBeTruthy()

    user!.avatar = undefined
    await user?.save()
    res = await request(app)
      .post(`/api/update-avatar/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', AVATAR2_PATH)
    expect(res.statusCode).toBe(200)
    avatarExists = await helper.exists(path.resolve(env.CDN_USERS, filename))
    expect(avatarExists).toBeTruthy()

    res = await request(app)
      .post(`/api/update-avatar/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    res = await request(app)
      .post(`/api/update-avatar/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', AVATAR2_PATH)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .post('/api/update-avatar/0')
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', AVATAR2_PATH)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/delete-avatar/:userId', () => {
  it("should delete user's avatar", async () => {
    const token = await testHelper.signinAsAdmin()

    let user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    expect(user?.avatar).toBeDefined()
    expect(user?.avatar).not.toBeNull()
    const filePath = path.join(env.CDN_USERS, user?.avatar as string)
    let avatarExists = await helper.exists(filePath)
    expect(avatarExists).toBeTruthy()
    let res = await request(app)
      .post(`/api/delete-avatar/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    avatarExists = await helper.exists(filePath)
    expect(avatarExists).toBeFalsy()
    user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    expect(user?.avatar).toBeUndefined()

    user!.avatar = `${nanoid()}.jpg`
    await user?.save()
    res = await request(app)
      .post(`/api/delete-avatar/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    user!.avatar = undefined
    await user?.save()
    res = await request(app)
      .post(`/api/delete-avatar/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .post(`/api/delete-avatar/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .post('/api/delete-avatar/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/delete-temp-avatar/:avatar', () => {
  it('should delete temporary avatar', async () => {
    const token = await testHelper.signinAsAdmin()

    const tempAvatar = path.join(env.CDN_TEMP_USERS, AVATAR1)
    if (!await helper.exists(tempAvatar)) {
      await fs.copyFile(AVATAR1_PATH, tempAvatar)
    }
    let res = await request(app)
      .post(`/api/delete-temp-avatar/${AVATAR1}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    const tempImageExists = await helper.exists(tempAvatar)
    expect(tempImageExists).toBeFalsy()

    res = await request(app)
      .post('/api/delete-temp-avatar/unknown.jpg')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/change-password', () => {
  it('should change password', async () => {
    const token = await testHelper.signinAsAdmin()

    const newPassword = `#${testHelper.PASSWORD}#`

    const payload: wexcommerceTypes.ChangePasswordPayload = {
      _id: USER1_ID,
      password: USER1_PASSWORD,
      newPassword,
      strict: true,
    }
    let res = await request(app)
      .post('/api/change-password')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    payload.password = newPassword
    payload.newPassword = USER1_PASSWORD
    payload.strict = false
    res = await request(app)
      .post('/api/change-password')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    payload.strict = true
    payload.password = ''
    res = await request(app)
      .post('/api/change-password')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    payload.password = 'wrong-password'
    res = await request(app)
      .post('/api/change-password')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    payload._id = testHelper.GetRandromObjectIdAsString()
    res = await request(app)
      .post('/api/change-password')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    const user = await User.findById(USER1_ID)
    expect(user).not.toBeNull()
    const password = user?.password
    user!.password = undefined
    await user?.save()
    payload._id = USER1_ID
    res = await request(app)
      .post('/api/change-password')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)
    user!.password = password
    await user?.save()

    payload._id = '0'
    res = await request(app)
      .post('/api/change-password')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/check-password/:id/:password', () => {
  it('should check password', async () => {
    const token = await testHelper.signinAsAdmin()

    // good password
    let res = await request(app)
      .get(`/api/check-password/${USER1_ID}/${encodeURIComponent(USER1_PASSWORD)}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    // password not found
    const user = await User.findById(USER1_ID)
    const pass = user?.password
    user!.password = undefined
    await user?.save()
    res = await request(app)
      .get(`/api/check-password/${USER1_ID}/${encodeURIComponent(USER1_PASSWORD)}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)
    user!.password = pass
    await user?.save()

    // wrong password
    res = await request(app)
      .get(`/api/check-password/${USER1_ID}/wrong-password`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // user not found
    res = await request(app)
      .get(`/api/check-password/${testHelper.GetRandromObjectIdAsString()}/some-password`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    // wrong user id
    res = await request(app)
      .get('/api/check-password/0/some-password')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/users/:page/:size', () => {
  it('should get users', async () => {
    const token = await testHelper.signinAsAdmin()

    let res = await request(app)
      .get(`/api/users/${testHelper.PAGE}/${testHelper.SIZE}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body[0].resultData.length).toBeGreaterThanOrEqual(2)

    res = await request(app)
      .get(`/api/users/${testHelper.PAGE}/${testHelper.SIZE}/?s=${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body[0].resultData.length).toBe(1)

    res = await request(app)
      .get(`/api/users/${testHelper.PAGE}/${testHelper.SIZE}/?s=${USER1_EMAIL}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body[0].resultData.length).toBe(1)

    res = await request(app)
      .get(`/api/users/unknown/${testHelper.SIZE}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/is-user', () => {
  it('should check user', async () => {
    const payload: wexcommerceTypes.IsUserPayload = {
      email: USER1_EMAIL,
    }
    let res = await request(app)
      .post('/api/is-user')
      .send(payload)
    expect(res.statusCode).toBe(200)

    payload.email = ADMIN_EMAIL
    res = await request(app)
      .post('/api/is-user')
      .send(payload)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .post('/api/is-user')
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/is-admin', () => {
  it('should check admin', async () => {
    const payload: wexcommerceTypes.IsAdminPayload = {
      email: ADMIN_EMAIL,
    }
    let res = await request(app)
      .post('/api/is-admin')
      .send(payload)
    expect(res.statusCode).toBe(200)

    payload.email = USER1_EMAIL
    res = await request(app)
      .post('/api/is-admin')
      .send(payload)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .post('/api/is-admin')
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/has-password', () => {
  it('should check if password exists', async () => {
    const token = await testHelper.signinAsUser()

    let res = await request(app)
      .get(`/api/has-password/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .get(`/api/has-password/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .get('/api/has-password/unknown')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/delete-users', () => {
  it('should delete users', async () => {
    const token = await testHelper.signinAsAdmin()

    let payload: string[] = [USER1_ID, ADMIN_ID]

    const order = new Order({
      user: USER1_ID,
      deliveryType: (await DeliveryType.findOne({ name: wexcommerceTypes.DeliveryType.Shipping }))?._id,
      paymentType: (await PaymentType.findOne({ name: wexcommerceTypes.PaymentType.CreditCard }))?._id,
      total: 312,
      status: wexcommerceTypes.OrderStatus.Pending,
      orderItems: [testHelper.GetRandromObjectId()],
    })
    await order.save()

    // add deleted avatar
    let res = await request(app)
      .post(`/api/update-avatar/${USER1_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', AVATAR2_PATH)
    expect(res.statusCode).toBe(200)

    let users = await User.find({ _id: { $in: payload } })
    expect(users.length).toBe(2)
    res = await request(app)
      .post('/api/delete-users')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    users = await User.find({ _id: { $in: payload } })
    expect(users.length).toBe(0)
    const o = await Order.findById(order._id)
    expect(o).toBeNull()

    payload = [testHelper.GetRandromObjectIdAsString()]
    res = await request(app)
      .post('/api/delete-users')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .post('/api/delete-users')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/verify-recaptcha/:token/:ip', () => {
  it('should verify reCAPTCHA', async () => {
    const ip = '134.236.60.166'
    const recaptchaToken = 'XXXXXX'
    const res = await request(app)
      .post(`/api/verify-recaptcha/${recaptchaToken}/${ip}`)
    expect(res.statusCode).toBe(204)
  })
})

describe('POST /api/send-email', () => {
  it('should send an email', async () => {
    const ip = '134.236.60.166'
    const recaptchaToken = 'XXXXXX'
    const payload = {
      from: 'no-reply@wexcommerce.com',
      to: 'test@test.com',
      subject: 'test',
      message: 'test message',
      recaptchaToken,
      ip,
    }
    const res = await request(app)
      .post('/api/send-email')
      .send(payload)
    expect(res.statusCode).toBe(400)
  })
})
