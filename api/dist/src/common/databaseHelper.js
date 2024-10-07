import mongoose from 'mongoose';
import * as env from "../config/env.config.js";
import * as logger from "./logger.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Category from "../models/Category.js";
import DeliveryType from "../models/DeliveryType.js";
import Notification from "../models/Notification.js";
import NotificationCounter from "../models/NotificationCounter.js";
import Order, { ORDER_EXPIRE_AT_INDEX_NAME } from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import PaymentType from "../models/PaymentType.js";
import Product from "../models/Product.js";
import Setting from "../models/Setting.js";
import Token, { TOKEN_EXPIRE_AT_INDEX_NAME } from "../models/Token.js";
import User from "../models/User.js";
import Value from "../models/Value.js";
import * as deliveryTypeController from "../controllers/deliveryTypeController.js";
import * as paymentTypeController from "../controllers/paymentTypeController.js";
import * as settingController from "../controllers/settingController.js";
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
export const connect = async (uri, ssl, debug) => {
  let options = {};
  if (ssl) {
    options = {
      tls: true,
      tlsCertificateKeyFile: env.DB_SSL_CERT,
      tlsCAFile: env.DB_SSL_CA
    };
  }
  mongoose.set('debug', debug);
  mongoose.Promise = globalThis.Promise;
  try {
    await mongoose.connect(uri, options);
    logger.info('Database is connected');
    return true;
  } catch (err) {
    logger.error('Cannot connect to the database:', err);
    return false;
  }
};
/**
 * Close database connection.
 *
 * @export
 * @async
 * @param {boolean} force
 * @returns {Promise<void>}
 */
export const close = async (force = false) => {
  await mongoose.connection.close(force);
};
/**
 * Create Token TTL index.
 *
 * @async
 * @returns {Promise<void>}
 */
const createTokenIndex = async () => {
  await Token.collection.createIndex({
    expireAt: 1
  }, {
    name: TOKEN_EXPIRE_AT_INDEX_NAME,
    expireAfterSeconds: env.TOKEN_EXPIRE_AT,
    background: true
  });
};
/**
 * Create Order TTL index.
 *
 * @async
 * @returns {Promise<void>}
 */
const createOrderIndex = async () => {
  await Order.collection.createIndex({
    expireAt: 1
  }, {
    name: ORDER_EXPIRE_AT_INDEX_NAME,
    expireAfterSeconds: env.ORDER_EXPIRE_AT,
    background: true
  });
};
const createCollection = async model => {
  try {
    await model.collection.indexes();
  } catch {
    await model.createCollection();
    await model.createIndexes();
  }
};
/**
 * Initialize database.
 *
 * @async
 * @returns {Promise<boolean>}
 */
export const initialize = async () => {
  try {
    if (mongoose.connection.readyState) {
      await createCollection(Cart);
      await createCollection(CartItem);
      await createCollection(Category);
      await createCollection(DeliveryType);
      await createCollection(Notification);
      await createCollection(NotificationCounter);
      await createCollection(Order);
      await createCollection(OrderItem);
      await createCollection(PaymentType);
      await createCollection(Product);
      await createCollection(Setting);
      await createCollection(Token);
      await createCollection(User);
      await createCollection(Value);
    }
    //
    // Update Order TTL index if configuration changes
    //
    const bookingIndexes = await Order.collection.indexes();
    const bookingIndex = bookingIndexes.find(index => index.name === ORDER_EXPIRE_AT_INDEX_NAME && index.expireAfterSeconds !== env.ORDER_EXPIRE_AT);
    if (bookingIndex) {
      try {
        await Order.collection.dropIndex(bookingIndex.name);
      } catch (err) {
        logger.error('Failed dropping Order TTL index', err);
      } finally {
        await createOrderIndex();
        await Order.createIndexes();
      }
    }
    //
    // Update Token TTL index if configuration changes
    //
    const tokenIndexes = await Token.collection.indexes();
    const tokenIndex = tokenIndexes.find(index => index.name.includes(TOKEN_EXPIRE_AT_INDEX_NAME));
    if (tokenIndex) {
      try {
        await Token.collection.dropIndex(tokenIndex.name);
      } catch (err) {
        logger.error('Failed dropping Token TTL index', err);
      } finally {
        await createTokenIndex();
        await Token.createIndexes();
      }
    }
    const res = (await deliveryTypeController.init()) && (await paymentTypeController.init()) && (await settingController.init());
    return res;
  } catch (err) {
    logger.error('An error occured while initializing database:', err);
    return false;
  }
};