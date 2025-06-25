import { constants } from 'node:fs'
import asyncFs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import validator from 'validator'
import Stripe from 'stripe'
import { nanoid } from 'nanoid'
import axios from 'axios'
import * as wexcommerceTypes from ':wexcommerce-types'

/**
 * Convert string to boolean.
 *
 * @export
 * @param {string} input
 * @returns {boolean}
 */
export const StringToBoolean = (input: string): boolean => {
  try {
    return Boolean(JSON.parse(input.toLowerCase()))
  } catch {
    return false
  }
}

/**
 * Check if a file or a folder exists.
 *
 * @export
 * @async
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
export const pathExists = async (filePath: string): Promise<boolean> => {
  try {
    await asyncFs.access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Create a folder recursively.
 *
 * @export
 * @async
 * @param {string} folder
 * @param {boolean} recursive
 * @returns {Promise<void>}
 */
export const mkdir = async (folder: string) => {
  await asyncFs.mkdir(folder, { recursive: true })
}

/**
 * Removes a start line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trimStart = (str: string, char: string): string => {
  let res = str
  while (res.charAt(0) === char) {
    res = res.substring(1, res.length)
  }
  return res
}

/**
 * Removes a leading and trailing line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trimEnd = (str: string, char: string): string => {
  let res = str
  while (res.charAt(res.length - 1) === char) {
    res = res.substring(0, res.length - 1)
  }
  return res
}

/**
 * Removes a stating, leading and trailing line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trim = (str: string, char: string): string => {
  let res = trimStart(str, char)
  res = trimEnd(res, char)
  return res
}

/**
 * Join two url parts.
 *
 * @export
 * @param {string} part1
 * @param {string} part2
 * @returns {string}
 */
export const joinURL = (part1: string, part2: string): string => {
  const p1 = trimEnd(part1, '/')
  let p2 = part2

  if (part2.charAt(0) === '/') {
    p2 = part2.substring(1)
  }

  return `${p1}/${p2}`
}

/**
 * Get filename without extension.
 *
 * @export
 * @param {string} filename
 * @returns {string}
 */
export const getFilenameWithoutExtension = (filename: string): string => path.parse(filename).name

/**
 * Clone an object or an array.
 *
 * @param {*} obj
 * @returns {*}
 */
export const clone = (obj: any) => (Array.isArray(obj) ? Array.from(obj) : ({ ...obj }))

/**
 * Check ObjectId.
 *
 * @param {?string} id
 * @returns {boolean}
 */
export const isValidObjectId = (id?: string) => mongoose.isValidObjectId(id)

/**
 * Check email.
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email?: string) => !!email && validator.isEmail(email)

/**
 * Generate user token.
 *
 * @returns {string}
 */
export const generateToken = () => `${nanoid()}-${Date.now()}`

/**
 * The IETF language tag of the locale Checkout is displayed in.
 *
 * @param {string} locale
 * @returns {Stripe.Checkout.SessionCreateParams.Locale}
 */
export const getStripeLocale = (locale: string): Stripe.Checkout.SessionCreateParams.Locale => {
  const locales = [
    'bg',
    'cs',
    'da',
    'de',
    'el',
    'en',
    'en-GB',
    'es',
    'es-419',
    'et',
    'fi',
    'fil',
    'fr',
    'fr-CA',
    'hr',
    'hu',
    'id',
    'it',
    'ja',
    'ko',
    'lt',
    'lv',
    'ms',
    'mt',
    'nb',
    'nl',
    'pl',
    'pt',
    'pt-BR',
    'ro',
    'ru',
    'sk',
    'sl',
    'sv',
    'th',
    'tr',
    'vi',
    'zh',
    'zh-HK',
    'zh-TW',
  ]

  if (locales.includes(locale)) {
    return locale as Stripe.Checkout.SessionCreateParams.Locale
  }

  return 'auto'
}

/**
 * Parse JWT token.
 *
 * @param {string} token
 * @returns {any}
 */
export const parseJwt = (token: string) => JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())

/**
 * Validate JWT token structure.
 *
 * @param {string} token
 * @returns {boolean}
 */
export const validateAccessToken = async (socialSignInType: wexcommerceTypes.SocialSignInType, token: string, email: string) => {
  if (socialSignInType === wexcommerceTypes.SocialSignInType.Facebook) {
    try {
      parseJwt(token)
      return true
    } catch {
      return false
    }
  }

  if (socialSignInType === wexcommerceTypes.SocialSignInType.Apple) {
    try {
      const res = parseJwt(token)
      return res.email === email
    } catch {
      return false
    }
  }

  if (socialSignInType === wexcommerceTypes.SocialSignInType.Google) {
    try {
      const res = await axios.get(
        'https://www.googleapis.com/oauth2/v3/tokeninfo',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      return res.data.email === email
    } catch {
      return false
    }
  }

  return false
}

/**
 * Format a number.
 *
 * @export
 * @param {number} x
 * @param {string} language ISO 639-1 language code
 * @returns {string}
 */
export const formatNumber = (x: number, language: string): string => {
  const parts: string[] = String(x % 1 !== 0 ? x.toFixed(2) : x).split('.')
  const separator = language === 'en' ? ',' : ' '
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return parts.join('.')
}

/**
 * Format price
 *
 * @param {number} price
 * @param {string} currency
 * @param {string} language ISO 639-1 language code
 * @returns {boolean}
 */
export const formatPrice = (price: number, currency: string, language: string) => {
  const formatedPrice = formatNumber(price, language)

  if (currency === '$') {
    return `$${formatedPrice}`
  }

  return `${formatedPrice} ${currency}`
}

/**
 * Format PayPal price.
 *
 * Example:
 * 1          1.00
 * 1.2        1.20
 * 1.341      1.34
 * 1.345      1.34
 * 1.378      1.37
 *
 * @param {number} price
 * @returns {string}
 */
export const formatPayPalPrice = (price: number) => (Math.floor(price * 100) / 100).toFixed(2)

/**
 * Delay in milliseconds.
 *
 * @param {number} ms 
 * @returns {*} 
 */
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

/**
 * Safe stringify object.
 *
 * @param {*} obj 
 * @returns {string} 
 */
export const safeStringify = (obj: any) => {
  try {
    return JSON.stringify(obj)
  } catch {
    return '[Unserializable object]'
  }
}

/**
 * Hash password using bcrypt.
 *
 * @async
 * @param {string} password 
 * @returns {Promise<string>} 
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}
