import stripeAPI from "../stripe.js";
import i18n from "../lang/i18n.js";
import * as logger from "../common/logger.js";
import * as wexcommerceTypes from "../../../../packages/wexcommerce-types/index.js";
import * as env from "../config/env.config.js";
import * as helper from "../common/helper.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Setting from "../models/Setting.js";
import PaymentType from "../models/PaymentType.js";
import DeliveryType from "../models/DeliveryType.js";
import * as orderController from "./orderController.js";
/**
 * Create Checkout Session.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const createCheckoutSession = async (req, res) => {
  const {
    amount,
    currency,
    locale,
    receiptEmail,
    name,
    description,
    customerName
  } = req.body;
  try {
    //
    // 1. Create the customer if he does not already exist
    //
    const customers = await stripeAPI.customers.list({
      email: receiptEmail
    });
    let customer;
    if (customers.data.length === 0) {
      customer = await stripeAPI.customers.create({
        email: receiptEmail,
        name: customerName
      });
    } else {
      [customer] = customers.data;
    }
    //
    // 2. Create checkout session
    //
    const expireAt = Math.floor(Date.now() / 1000 + env.STRIPE_SESSION_EXPIRE_AT);
    const session = await stripeAPI.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [{
        price_data: {
          product_data: {
            name
          },
          unit_amount: Math.floor(amount * 100),
          currency: currency.toLowerCase()
        },
        quantity: 1
      }],
      mode: 'payment',
      return_url: `${helper.trimEnd(env.FRONTEND_HOST, '/')}/checkout-session/{CHECKOUT_SESSION_ID}`,
      customer: customer.id,
      locale: helper.getStripeLocale(locale),
      payment_intent_data: {
        description
      },
      expires_at: expireAt
    });
    const result = {
      sessionId: session.id,
      customerId: customer.id,
      clientSecret: session.client_secret
    };
    return res.json(result);
  } catch (err) {
    logger.error(`[stripe.createCheckoutSession] ${i18n.t('ERROR')}`, err);
    return res.status(400).send(i18n.t('ERROR') + err);
  }
};
/**
 * Check Checkout Session and update order if the payment succeeded.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const checkCheckoutSession = async (req, res) => {
  try {
    const {
      sessionId
    } = req.params;
    //
    // 1. Retrieve Checkout Sesssion and Order
    //
    let session;
    try {
      session = await stripeAPI.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      logger.error(`[stripe.checkCheckoutSession] retrieve session error: ${sessionId}`, err);
    }
    if (!session) {
      const msg = `Session ${sessionId} not found`;
      logger.info(`[stripe.checkCheckoutSession] ${msg}`);
      return res.status(204).send(msg);
    }
    const order = await Order.findOne({
      sessionId,
      expireAt: {
        $ne: null
      }
    }).populate('orderItems');
    if (!order) {
      const msg = `Order with sessionId ${sessionId} not found`;
      logger.info(`[stripe.checkCheckoutSession] ${msg}`);
      return res.status(204).send(msg);
    }
    //
    // 2. Update Order if the payment succeeded
    // (Set OrderStatus to Paid and remove expireAt TTL index)
    //
    if (session.payment_status === 'paid') {
      order.expireAt = undefined;
      order.status = wexcommerceTypes.OrderStatus.Paid;
      await order.save();
      // Update product quantity
      for (const orderItem of order.orderItems) {
        const product = await Product.findById(orderItem.product);
        if (!product) {
          throw new Error(`Product ${orderItem.product} not found`);
        }
        product.quantity -= orderItem.quantity;
        await product.save();
      }
      // Send confirmation email
      const user = await User.findById(order.user);
      if (!user) {
        logger.info(`User ${order.user} not found`);
        return res.sendStatus(204);
      }
      const settings = await Setting.findOne();
      if (!settings) {
        throw new Error('Settings not found');
      }
      const paymentType = (await PaymentType.findById(order.paymentType)).name;
      const deliveryType = (await DeliveryType.findById(order.deliveryType)).name;
      await orderController.confirm(user, order, order.orderItems, settings, paymentType, deliveryType);
      // Notify admin
      const admin = !!env.ADMIN_EMAIL && (await User.findOne({
        email: env.ADMIN_EMAIL,
        type: wexcommerceTypes.UserType.Admin
      }));
      if (admin) {
        await orderController.notify(admin, order, user, settings);
      }
      return res.sendStatus(200);
    }
    //
    // 3. Delete Order if the payment didn't succeed
    //
    await order.deleteOne();
    return res.status(400).send(session.payment_status);
  } catch (err) {
    logger.error(`[stripe.checkCheckoutSession] ${i18n.t('ERROR')}`, err);
    return res.status(400).send(i18n.t('ERROR') + err);
  }
};
/**
 * Create Payment Intent.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const createPaymentIntent = async (req, res) => {
  const {
    amount,
    currency,
    receiptEmail,
    description,
    customerName
  } = req.body;
  try {
    //
    // 1. Create the customer if he does not already exist
    //
    const customers = await stripeAPI.customers.list({
      email: receiptEmail
    });
    let customer;
    if (customers.data.length === 0) {
      customer = await stripeAPI.customers.create({
        email: receiptEmail,
        name: customerName
      });
    } else {
      [customer] = customers.data;
    }
    //
    // 2. Create payment intent
    //
    const paymentIntent = await stripeAPI.paymentIntents.create({
      //
      // All API requests expect amounts to be provided in a currency’s smallest unit.
      // For example, to charge 10 USD, provide an amount value of 1000 (that is, 1000 cents).
      //
      amount: Math.floor(amount * 100),
      currency: currency.toLowerCase(),
      receipt_email: receiptEmail,
      description,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });
    //
    // 3. Send result
    //
    const result = {
      paymentIntentId: paymentIntent.id,
      customerId: customer.id,
      clientSecret: paymentIntent.client_secret
    };
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`[stripe.createPaymentIntent] ${i18n.t('ERROR')}`, err);
    return res.status(400).send(i18n.t('ERROR') + err);
  }
};