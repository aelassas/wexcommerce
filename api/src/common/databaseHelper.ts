import mongoose, { ConnectOptions, Model } from 'mongoose'
import * as env from '../config/env.config'
import * as logger from './logger'
import Cart from '../models/Cart'
import CartItem from '../models/CartItem'
import Category from '../models/Category'
import DeliveryType from '../models/DeliveryType'
import Notification from '../models/Notification'
import NotificationCounter from '../models/NotificationCounter'
import OrderItem, { ORDER_ITEM_EXPIRE_AT_INDEX_NAME } from '../models/OrderItem'
import Order, { ORDER_EXPIRE_AT_INDEX_NAME } from '../models/Order'
import PaymentType from '../models/PaymentType'
import Product from '../models/Product'
import Setting from '../models/Setting'
import Token, { TOKEN_EXPIRE_AT_INDEX_NAME } from '../models/Token'
import User, { USER_EXPIRE_AT_INDEX_NAME } from '../models/User'
import Value from '../models/Value'
import * as deliveryTypeController from '../controllers/deliveryTypeController'
import * as paymentTypeController from '../controllers/paymentTypeController'
import * as settingController from '../controllers/settingController'

/**
 * Connect to database.
 *
 * @export
 * @async
 * @param {string} uri
 * @param {boolean} ssl
 * @param {boolean} debug
 * @returns {Promise<boolean>}
 */
export const connect = async (uri: string, ssl: boolean, debug: boolean): Promise<boolean> => {
  let options: ConnectOptions = {}

  if (ssl) {
    options = {
      tls: true,
      tlsCertificateKeyFile: env.DB_SSL_CERT,
      tlsCAFile: env.DB_SSL_CA,
    }
  }

  mongoose.set('debug', debug)
  mongoose.Promise = globalThis.Promise

  try {
    await mongoose.connect(uri, options)
    logger.info('Database is connected')
    return true
  } catch (err) {
    logger.error('Cannot connect to the database:', err)
    return false
  }
}

/**
 * Close database connection.
 *
 * @export
 * @async
 * @param {boolean} force
 * @returns {Promise<void>}
 */
export const close = async (force: boolean = false): Promise<void> => {
  await mongoose.connection.close(force)
}

/**
 * Create Token TTL index.
 *
 * @async
 * @returns {Promise<void>}
 */
const createTokenIndex = async (): Promise<void> => {
  await Token.collection.createIndex({ expireAt: 1 }, { name: TOKEN_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.TOKEN_EXPIRE_AT, background: true })
}

/**
 * Create OrderItem TTL index.
 *
 * @async
 * @returns {Promise<void>}
 */
const createOrderItemIndex = async (): Promise<void> => {
  await OrderItem.collection.createIndex({ expireAt: 1 }, { name: ORDER_ITEM_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.ORDER_EXPIRE_AT, background: true })
}

/**
 * Create Order TTL index.
 *
 * @async
 * @returns {Promise<void>}
 */
const createOrderIndex = async (): Promise<void> => {
  await Order.collection.createIndex({ expireAt: 1 }, { name: ORDER_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.ORDER_EXPIRE_AT, background: true })
}

/**
 * Create User TTL index.
 *
 * @async
 * @returns {Promise<void>}
 */
const createUserIndex = async (): Promise<void> => {
  await User.collection.createIndex({ expireAt: 1 }, { name: USER_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.USER_EXPIRE_AT, background: true })
}

const createCollection = async<T>(model: Model<T>) => {
  try {
    await model.collection.indexes()
  } catch {
    await model.createCollection()
    await model.createIndexes()
  }
}

/**
 * Initialize database.
 *
 * @async
 * @returns {Promise<boolean>}
 */
export const initialize = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState) {
      await createCollection<env.Cart>(Cart)
      await createCollection<env.CartItem>(CartItem)
      await createCollection<env.Category>(Category)
      await createCollection<env.DeliveryType>(DeliveryType)
      await createCollection<env.Notification>(Notification)
      await createCollection<env.NotificationCounter>(NotificationCounter)
      await createCollection<env.Order>(Order)
      await createCollection<env.OrderItem>(OrderItem)
      await createCollection<env.PaymentType>(PaymentType)
      await createCollection<env.Product>(Product)
      await createCollection<env.Setting>(Setting)
      await createCollection<env.Token>(Token)
      await createCollection<env.User>(User)
      await createCollection<env.Value>(Value)
    }

    //
    // Update Order TTL index if configuration changes
    //
    const orderItemIndexes = await OrderItem.collection.indexes()
    const orderItemIndex = orderItemIndexes.find((index: any) => index.name === ORDER_ITEM_EXPIRE_AT_INDEX_NAME && index.expireAfterSeconds !== env.ORDER_EXPIRE_AT)
    if (orderItemIndex) {
      try {
        await OrderItem.collection.dropIndex(orderItemIndex.name!)
      } catch (err) {
        logger.error('Failed dropping OrderItem TTL index', err)
      } finally {
        await createOrderItemIndex()
        await OrderItem.createIndexes()
      }
    }

    //
    // Update Order TTL index if configuration changes
    //
    const orderIndexes = await Order.collection.indexes()
    const orderIndex = orderIndexes.find((index: any) => index.name === ORDER_EXPIRE_AT_INDEX_NAME && index.expireAfterSeconds !== env.ORDER_EXPIRE_AT)
    if (orderIndex) {
      try {
        await Order.collection.dropIndex(orderIndex.name!)
      } catch (err) {
        logger.error('Failed dropping Order TTL index', err)
      } finally {
        await createOrderIndex()
        await Order.createIndexes()
      }
    }

    //
    // Update User TTL index if configuration changes
    //
    const userIndexes = await User.collection.indexes()
    const userIndex = userIndexes.find((index: any) => index.name === USER_EXPIRE_AT_INDEX_NAME && index.expireAfterSeconds !== env.USER_EXPIRE_AT)
    if (userIndex) {
      try {
        await User.collection.dropIndex(userIndex.name!)
      } catch (err) {
        logger.error('Failed dropping User TTL index', err)
      } finally {
        await createUserIndex()
        await User.createIndexes()
      }
    }

    //
    // Update Token TTL index if configuration changes
    //
    const tokenIndexes = await Token.collection.indexes()
    const tokenIndex = tokenIndexes.find((index: any) => index.name.includes(TOKEN_EXPIRE_AT_INDEX_NAME))
    if (tokenIndex) {
      try {
        await Token.collection.dropIndex(tokenIndex.name!)
      } catch (err) {
        logger.error('Failed dropping Token TTL index', err)
      } finally {
        await createTokenIndex()
        await Token.createIndexes()
      }
    }

    const res = (await deliveryTypeController.init()) && (await paymentTypeController.init()) && (await settingController.init())

    return res
  } catch (err) {
    logger.error('An error occured while initializing database:', err)
    return false
  }
}
