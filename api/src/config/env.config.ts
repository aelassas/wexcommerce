import process from 'node:process'
import { Document, Types } from 'mongoose'
import { CookieOptions } from 'express'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as helper from '../common/helper'

/**
 * Get environment variable value.
 *
 * @param {string} name
 * @param {?boolean} [required]
 * @param {?string} [defaultValue]
 * @returns {string}
 */
export const __env__ = (name: string, required?: boolean, defaultValue?: string): string => {
  const value = process.env[name]
  if (required && !value) {
    throw new Error(`'${name} not found`)
  }
  if (!value) {
    return defaultValue || ''
  }
  return String(value)
}

/**
 * ISO 639-1 language codes supported
 * https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 *
 * @type {string[]}
 */
export const LANGUAGES = [
  'en',
  'fr',
]

/**
 * Server Port. Default is 4002.
 *
 * @type {number}
 */
export const PORT = Number.parseInt(__env__('WC_PORT', false, '4004'), 10)

/**
 * Indicate whether HTTPS is enabled or not.
 *
 * @type {boolean}
 */
export const HTTPS = helper.StringToBoolean(__env__('WC_HTTPS'))

/**
 * Private SSL key filepath.
 *
 * @type {string}
 */
export const PRIVATE_KEY = __env__('WC_PRIVATE_KEY', HTTPS)

/**
 * Private SSL certificate filepath.
 *
 * @type {string}
 */
export const CERTIFICATE = __env__('WC_CERTIFICATE', HTTPS)

/**
 * MongoDB database URI. Default is: mongodb://127.0.0.1:27017/wexcommerce?authSource=admin&appName=wexcommerce
 *
 * @type {string}
 */
export const DB_URI = __env__('WC_DB_URI', false, 'mongodb://127.0.0.1:27017/wexcommerce?authSource=admin&appName=wexcommerce')

/**
 * Indicate whether MongoDB SSL is enabled or not.
 *
 * @type {boolean}
 */
export const DB_SSL = helper.StringToBoolean(__env__('WC_DB_SSL', false, 'false'))

/**
 * MongoDB SSL certificate filepath.
 *
 * @type {string}
 */
export const DB_SSL_CERT = __env__('WC_DB_SSL_CERT', DB_SSL)

/**
 * MongoDB SSL CA certificate filepath.
 *
 * @type {string}
 */
export const DB_SSL_CA = __env__('WC_DB_SSL_CA', DB_SSL)

/**
 * Indicate whether MongoDB debug is enabled or not.
 *
 * @type {boolean}
 */
export const DB_DEBUG = helper.StringToBoolean(__env__('WC_DB_DEBUG', false, 'false'))

/**
 * Cookie secret. It should at least be 32 characters long, but the longer the better.
 *
 * @type {string}
 */
export const COOKIE_SECRET = __env__('WC_COOKIE_SECRET', false, 'wexcommerce')

/**
 * Authentication cookie domain.
 * Default is localhost.
 *
 * @type {string}
 */
export const AUTH_COOKIE_DOMAIN = __env__('WC_AUTH_COOKIE_DOMAIN', false, 'localhost')

/**
 * Cookie options.
 *
 * On production, authentication cookies are httpOnly, signed, secure and strict sameSite.
 * This will prevent XSS attacks by not allowing access to the cookie via JavaScript.
 * This will prevent CSRF attacks by not allowing the browser to send the cookie along with cross-site requests.
 * This will prevent MITM attacks by only allowing the cookie to be sent over HTTPS.
 * Authentication cookies are protected against XST attacks as well by disabling TRACE HTTP method via allowedMethods middleware.
 *
 * @type {CookieOptions}
 */
export const COOKIE_OPTIONS: CookieOptions = { httpOnly: true, secure: HTTPS, signed: true, sameSite: 'strict', domain: AUTH_COOKIE_DOMAIN }

/**
 * frontend authentication cookie name.
 *
 * @type {"wc-x-access-token-frontend"}
 */
export const FRONTEND_AUTH_COOKIE_NAME = 'wc-x-access-token-frontend'

/**
 * Backend authentication cookie name.
 *
 * @type {"wc-x-access-token-frontend"}
 */
export const BACKEND_AUTH_COOKIE_NAME = 'wc-x-access-token-backend'

/**
 * Mobile App and unit tests authentication header name.
 *
 * @type {"x-access-token"}
 */
export const X_ACCESS_TOKEN = 'x-access-token'

/**
 * JWT secret. It should at least be 32 characters long, but the longer the better.
 *
 * @type {string}
 */
export const JWT_SECRET = __env__('WC_JWT_SECRET', false, 'wexcommerce')

/**
 * JWT expiration in seconds. Default is 86400 seconds (1 day).
 *
 * @type {number}
 */
export const JWT_EXPIRE_AT = Number.parseInt(__env__('WC_JWT_EXPIRE_AT', false, '86400'), 10)

/**
 * Validation Token expiration in seconds. Default is 86400 seconds (1 day).
 *
 * @type {number}
 */
export const TOKEN_EXPIRE_AT = Number.parseInt(__env__('WC_TOKEN_EXPIRE_AT', false, '86400'), 10)

/**
 * SMTP host.
 *
 * @type {string}
 */
export const SMTP_HOST = __env__('WC_SMTP_HOST', true)

/**
 * SMTP port.
 *
 * @type {number}
 */
export const SMTP_PORT = Number.parseInt(__env__('WC_SMTP_PORT', true), 10)

/**
 * SMTP username.
 *
 * @type {string}
 */
export const SMTP_USER = __env__('WC_SMTP_USER', true)

/**
 * SMTP password.
 *
 * @type {string}
 */
export const SMTP_PASS = __env__('WC_SMTP_PASS', true)

/**
 * SMTP from email.
 *
 * @type {string}
 */
export const SMTP_FROM = __env__('WC_SMTP_FROM', true)

/**
 * Users' cdn folder path.
 *
 * @type {string}
 */
export const CDN_USERS = __env__('WC_CDN_USERS', true)

/**
 * Users' temp cdn folder path.
 *
 * @type {string}
 */
export const CDN_TEMP_USERS = __env__('WC_CDN_TEMP_USERS', true)

/**
 * Locations' cdn folder path.
 *
 * @type {string}
 */
export const CDN_CATEGORIES = __env__('WC_CDN_CATEGORIES', true)

/**
 * Locations' temp cdn folder path.
 *
 * @type {string}
 */
export const CDN_TEMP_CATEGORIES = __env__('WC_CDN_TEMP_CATEGORIES', true)

/**
 * Cars' cdn folder path.
 *
 * @type {string}
 */
export const CDN_PRODUCTS = __env__('WC_CDN_PRODUCTS', true)

/**
 * Cars' temp cdn folder path.
 *
 * @type {string}
 */
export const CDN_TEMP_PRODUCTS = __env__('WC_CDN_TEMP_PRODUCTS', true)

/**
 * Backend host.
 *
 * @type {string}
 */
export const BACKEND_HOST = __env__('WC_BACKEND_HOST', true)

/**
 * Frontend host.
 *
 * @type {string}
 */
export const FRONTEND_HOST = __env__('WC_FRONTEND_HOST', true)

/**
 * Default language. Default is en. Available options: en, fr.
 *
 * @type {string}
 */
export const DEFAULT_LANGUAGE = __env__('WC_DEFAULT_LANGUAGE', false, 'en')

/**
 * Default currency. Default is $.
 *
 * @type {string}
 */
export const DEFAULT_CURRENCY = __env__('WC_DEFAULT_CURRENCY', false, '$')

/**
 * Default Stripe currence. Default is USD. https://docs.stripe.com/currencies
 *
 * @type {string}
 */
export const DEFAULT_STRIPE_CURRENCY = __env__('WC_DEFAULT_STRIPE_CURRENCY', false, 'USD')

/**
 * Stripe secret key.
 *
 * @type {string}
 */
export const STRIPE_SECRET_KEY = __env__('WC_STRIPE_SECRET_KEY', false, 'STRIPE_SECRET_KEY')

let stripeSessionExpireAt = Number.parseInt(__env__('WC_STRIPE_SESSION_EXPIRE_AT', false, '82800'), 10)
stripeSessionExpireAt = stripeSessionExpireAt < 1800 ? 1800 : stripeSessionExpireAt
stripeSessionExpireAt = stripeSessionExpireAt <= 82800 ? stripeSessionExpireAt : 82800

/**
 * Stripe Checkout Session expiration in seconds. Should be at least 1800 seconds (30min) and max 82800 seconds. Default is 82800 seconds (~23h).
 * If the value is lower than 1800 seconds, it wil be set to 1800 seconds.
 * If the value is greater than 82800 seconds, it wil be set to 82800 seconds.
 *
 * @type {number}
 */
export const STRIPE_SESSION_EXPIRE_AT = stripeSessionExpireAt

/**
 * Order expiration in seconds.
 * Orders created from checkout with Stripe are temporary and are automatically deleted if the payment checkout session expires.
 *
 * @type {number}
 */
export const ORDER_EXPIRE_AT = STRIPE_SESSION_EXPIRE_AT + (10 * 60)

/**
 * User expiration in seconds.
 * Non verified and active users created from checkout with Stripe are temporary and are automatically deleted if the payment checkout session expires.
 *
 *
 * @type {number}
 */
export const USER_EXPIRE_AT = ORDER_EXPIRE_AT

/**
 * Admin email.
 *
 * @type {string}
 */
export const ADMIN_EMAIL = __env__('WC_ADMIN_EMAIL', false)

/**
 * Google reCAPTCHA v3 secret key.
 *
 * @type {string}
 */
export const RECAPTCHA_SECRET = __env__('WC_RECAPTCHA_SECRET', false)

/**
 * User Document.
 *
 * @export
 * @interface User
 * @typedef {User}
 * @extends {Document}
 */
export interface User extends Document {
  email: string
  fullName: string
  phone?: string
  address?: string
  password?: string
  active?: boolean
  verified?: boolean
  verifiedAt?: Date
  language: string
  type?: wexcommerceTypes.UserType
  blacklisted?: boolean
  customerId?: string
  avatar?: string
  expireAt?: Date
}

/**
 * UserInfo.
 *
 * @export
 * @interface UserInfo
 * @typedef {UserInfo}
 */
export interface UserInfo {
  _id?: Types.ObjectId
  email: string
  fullName: string
  phone?: string
  address?: string
  password?: string
  active?: boolean
  verified?: boolean
  verifiedAt?: Date
  language: string
  type?: wexcommerceTypes.UserType
  blacklisted?: boolean
  customerId?: string
}

/**
 * Token Document.
 *
 * @export
 * @interface Token
 * @typedef {Token}
 * @extends {Document}
 */
export interface Token extends Document {
  user: Types.ObjectId
  token: string
  expireAt?: Date
}

/**
 * Notification Document.
 *
 * @export
 * @interface Notification
 * @typedef {Notification}
 * @extends {Document}
 */
export interface Notification extends Document {
  user: Types.ObjectId
  message: string
  order: Types.ObjectId
  isRead?: boolean
}

/**
 * NotificationCounter Document.
 *
 * @export
 * @interface NotificationCounter
 * @typedef {NotificationCounter}
 * @extends {Document}
 */
export interface NotificationCounter extends Document {
  user: Types.ObjectId
  count: number
}

/**
 * Value Document.
 *
 * @export
 * @interface Value
 * @typedef {Value}
 * @extends {Document}
 */
export interface Value extends Document {
  language: string
  value: string
}

/**
 * Cart Document.
 *
 * @export
 * @interface Cart
 * @typedef {Cart}
 * @extends {Document}
 */
export interface Cart extends Document {
  user: Types.ObjectId
  cartItems: Types.ObjectId[]
}

/**
 * CartItem Document.
 *
 * @export
 * @interface CartItem
 * @typedef {CartItem}
 * @extends {Document}
 */
export interface CartItem extends Document {
  product: Types.ObjectId
  quantity: number
}

/**
 * Wishlist Document.
 *
 * @export
 * @interface Wishlist
 * @typedef {Wishlist}
 * @extends {Document}
 */
export interface Wishlist extends Document {
  user: Types.ObjectId
  products: Types.ObjectId[]
}

/**
 * Category Document.
 *
 * @export
 * @interface Category
 * @typedef {Category}
 * @extends {Document}
 */
export interface Category extends Document {
  values: Types.ObjectId[]
  image?: string
  featured: boolean
}

/**
 * DeliveryType Document.
 *
 * @export
 * @interface DeliveryType
 * @typedef {DeliveryType}
 * @extends {Document}
 */
export interface DeliveryType extends Document {
  name: wexcommerceTypes.DeliveryType
  enabled: boolean
  price: number
}

/**
 * Product Document.
 *
 * @export
 * @interface Product
 * @typedef {Product}
 * @extends {Document}
 */
export interface Product extends Document {
  name: string
  description: string
  categories: Types.ObjectId[]
  image?: string
  images?: string[]
  price: number
  quantity: number
  soldOut: boolean
  hidden: boolean
  featured: boolean
}

/**
 * OrderItem Document.
 *
 * @export
 * @interface OrderItem
 * @typedef {OrderItem}
 * @extends {Document}
 */
export interface OrderItem extends Document {
  product: Types.ObjectId | Product
  quantity: number
}

/**
 * Order Document.
 *
 * @export
 * @interface Order
 * @typedef {Order}
 * @extends {Document}
 */
export interface Order extends Document {
  user: Types.ObjectId
  deliveryType: Types.ObjectId
  paymentType: Types.ObjectId
  total: number
  status: wexcommerceTypes.OrderStatus
  orderItems?: Types.ObjectId[] | OrderItem[]
  sessionId?: string
  paymentIntentId?: string
  customerId?: string
  expireAt?: Date
}

/**
 * PaymentType Document.
 *
 * @export
 * @interface PaymentType
 * @typedef {PaymentType}
 * @extends {Document}
 */
export interface PaymentType extends Document {
  name: wexcommerceTypes.PaymentType
  enabled: boolean
}

/**
 * Setting Document.
 *
 * @export
 * @interface Setting
 * @typedef {Setting}
 * @extends {Document}
 */
export interface Setting extends Document {
  language: string
  currency: string
  stripeCurrency: string
  bankName?: string
  accountHolder?: string
  rib?: string
  iban?: string
}
