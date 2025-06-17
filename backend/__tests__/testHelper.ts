import request from 'supertest'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import mongoose from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import app from '../src/app'
import * as env from '../src/config/env.config'
import User from '../src/models/User'
import Notification from '../src/models/Notification'
import NotificationCounter from '../src/models/NotificationCounter'
import * as logger from '../src/common/logger'
import * as paymentTypeController from '../src/controllers/paymentTypeController'
import * as deliveryTypeController from '../src/controllers/deliveryTypeController'
import * as settingController from '../src/controllers/settingController'

export const getName = (prefix: string) => {
  expect(prefix.length).toBeGreaterThan(1)
  return `${prefix}.${nanoid()}.${Date.now()}`.toLowerCase()
}

export const getRandomString = () => getName(Date.now().toString())

export const getSupplierName = () => getName('supplier')

export const ADMIN_EMAIL = `${getName('admin')}@test.wexcommerce.com`
export const USER_EMAIL = `${getName('user')}@test.wexcommerce.com`
export const USER_FULL_NAME = 'user'
export const PASSWORD = 'Un1tTest5'
export const LANGUAGE = 'en'
export const PAGE = 1
export const SIZE = 30

let ADMIN_USER_ID: string
let USER_ID: string

export const initializeLogger = (disable = true) => {
  if (disable) {
    logger.disableLogging()
  }
}

export const initialize = async () => {
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(PASSWORD, salt)

  // admin
  const admin = new User({
    fullName: 'admin',
    email: ADMIN_EMAIL,
    language: LANGUAGE,
    password: passwordHash,
    type: wexcommerceTypes.UserType.Admin,
  })
  await admin.save()
  expect(admin.id).toBeDefined()
  ADMIN_USER_ID = admin.id

  // user
  const user = new User({
    fullName: USER_FULL_NAME,
    email: USER_EMAIL,
    language: LANGUAGE,
    password: passwordHash,
    type: wexcommerceTypes.UserType.User,
  })
  await user.save()
  expect(user.id).toBeDefined()
  USER_ID = user.id

  await paymentTypeController.init()
  await deliveryTypeController.init()
  await settingController.init()
}

export const getAdminUserId = () => ADMIN_USER_ID

export const getUserId = () => USER_ID

export const close = async () => {
  const res = await User.deleteMany({ email: { $in: [ADMIN_EMAIL, USER_EMAIL] } })
  expect(res.deletedCount).toBe(2)
  await Notification.deleteMany({ user: { $in: [ADMIN_USER_ID, USER_ID] } })
  await NotificationCounter.deleteMany({ user: { $in: [ADMIN_USER_ID, USER_ID] } })
}

export const getToken = (cookie: string) => {
  const signedCookie = decodeURIComponent(cookie)
  const token = cookieParser.signedCookie((signedCookie.match(`${env.X_ACCESS_TOKEN}=(s:.*?);`) ?? [])[1], env.COOKIE_SECRET) as string
  return token
}

const signin = async (appType: wexcommerceTypes.AppType, email: string) => {
  const payload: wexcommerceTypes.SignInPayload = {
    email,
    password: PASSWORD,
  }

  const res = await request(app)
    .post(`/api/sign-in/${appType}`)
    .send(payload)

  expect(res.statusCode).toBe(200)
  expect(res.body.accessToken).toBeDefined()
  return res.body.accessToken
}

export const signinAsAdmin = () => signin(wexcommerceTypes.AppType.Admin, ADMIN_EMAIL)

export const signinAsUser = () => signin(wexcommerceTypes.AppType.Frontend, USER_EMAIL)

export const GetRandomEmail = () => `${getName('random')}@test.wexcommerce.com`

export const GetRandromObjectId = () => new mongoose.Types.ObjectId()

export const GetRandromObjectIdAsString = () => GetRandromObjectId().toString()

export const delay = (milliseconds: number) => new Promise((resolve) => {
  setTimeout(resolve, milliseconds)
})
