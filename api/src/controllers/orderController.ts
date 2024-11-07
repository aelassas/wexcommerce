import mongoose, { Expression } from 'mongoose'
import { Request, Response } from 'express'
import escapeStringRegexp from 'escape-string-regexp'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as logger from '../common/logger'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import User from '../models/User'
import Token from '../models/Token'
import Order from '../models/Order'
import OrderItem from '../models/OrderItem'
import Notification from '../models/Notification'
import NotificationCounter from '../models/NotificationCounter'
import Setting from '../models/Setting'
import PaymentType from '../models/PaymentType'
import DeliveryType from '../models/DeliveryType'
import * as helper from '../common/helper'
import * as mailHelper from '../common/mailHelper'
import stripeAPI from '../stripe'

/**
 * Confirm checkout.
 *
 * @async
 * @param {env.User} _user
 * @param {env.Order} __order
 * @param {env.OrderItem[]} orderItems
 * @param {env.Setting} settings
 * @param {wexcommerceTypes.PaymentType} paymentType
 * @param {wexcommerceTypes.DeliveryType} deliveryType
 * @returns {*}
 */
export const confirm = async (_user: env.User, __order: env.Order, orderItems: env.OrderItem[], settings: env.Setting, paymentType: wexcommerceTypes.PaymentType, deliveryType: wexcommerceTypes.DeliveryType) => {
  i18n.locale = settings.language
  const mailOptions = {
    from: env.SMTP_FROM,
    to: _user.email,
    subject: i18n.t('ORDER_CONFIRMED_PART_1') + __order._id + i18n.t('ORDER_CONFIRMED_PART_2'),
    html: `<p>${i18n.t('HELLO')}${_user.fullName},<br><br>${i18n.t('ORDER_CONFIRMED_PART_1')}${__order._id}${i18n.t('ORDER_CONFIRMED_PART_2')}<br><br>
    ${orderItems.map((orderItem) => (
      `<b>${i18n.t('PRODUCT')}</b> ${(orderItem.product as env.Product).name}<br>`
      + `<b>${i18n.t('QUANTITY')}</b> ${orderItem.quantity}<br>`
      + `<b>${i18n.t('PRICE')}</b> ${helper.formatPrice((orderItem.product as env.Product).price, settings.currency, settings.language)} <br>`
    )).join('<br>')

      }<br><b>${i18n.t('TOTAL')}</b> ${helper.formatPrice(__order.total, settings.currency, settings.language)}<br><br>`

      + `<b>${i18n.t('PAYMENT_TYPE')}</b> ${paymentType === wexcommerceTypes.PaymentType.CreditCard ? i18n.t('CREDIT_CARD')
        : paymentType === wexcommerceTypes.PaymentType.Cod ? i18n.t('COD')
          : paymentType === wexcommerceTypes.PaymentType.WireTransfer ? i18n.t('WIRE_TRANSFER')
            : ''}<br><br>`

      + `<b>${i18n.t('DELIVERY_TYPE')}</b> ${deliveryType === wexcommerceTypes.DeliveryType.Shipping ? i18n.t('SHIPPING')
        : deliveryType === wexcommerceTypes.DeliveryType.Withdrawal ? i18n.t('WITHDRAWAL')
          : ''}<br><br>${paymentType === wexcommerceTypes.PaymentType.WireTransfer ? (
            `${i18n.t('WIRE_TRANSFER_PART_1')}<br><br>`
            + `<b>${i18n.t('BANK_NAME')}</b> ${settings.bankName}<br>`
            + `<b>${i18n.t('ACCOUNT_HOLDER')}</b> ${settings.accountHolder}<br>`
            + `<b>${i18n.t('RIB')}</b> ${settings.rib}<br>`
            + `<b>${i18n.t('IBAN')}</b> ${settings.iban}<br><br>`
          ) : ''

      }${i18n.t('ORDER_CONFIRMED_PART_3')}<br><br>${helper.joinURL(env.FRONTEND_HOST, 'orders')
      }?o=${encodeURIComponent(__order.id)
      }<br><br>${i18n.t('REGARDS')}<br>`
      + '</p>',
  }
  await mailHelper.sendMail(mailOptions)
}

/**
 * Notify admin.
 *
 * @async
 * @param {env.User} admin
 * @param {env.Order} __order
 * @param {env.User} _user
 * @param {env.Setting} settings
 * @returns {*}
 */
export const notify = async (admin: env.User, __order: env.Order, _user: env.User, settings: env.Setting) => {
  i18n.locale = settings.language
  // admin email
  const mailOptions = {
    from: env.SMTP_FROM,
    to: admin.email,
    subject: `${i18n.t('NEW_ORDER_SUBJECT')} ${__order._id}`,
    html: `<p>${i18n.t('HELLO')}${admin.fullName},<br><br>${i18n.t('NEW_ORDER_PART_1')}${__order._id}${i18n.t('NEW_ORDER_PART_2')}<br><br>${i18n.t('NEW_ORDER_PART_3')}<br><br>
    ${helper.joinURL(env.BACKEND_HOST, 'orders')}?o=${encodeURIComponent(__order.id)
      }<br><br>${i18n.t('REGARDS')}<br>`
      + '</p>',
  }
  await mailHelper.sendMail(mailOptions)

  // admin notification
  const message = `${_user.fullName} ${i18n.t('MADE_ORDER')} ${__order._id}.`
  const notification = new Notification({ user: admin._id, message, order: __order._id })

  await notification.save()
  let counter = await NotificationCounter.findOne({ user: admin._id })
  if (counter) {
    counter.count += 1
    await counter.save()
  } else {
    counter = new NotificationCounter({ user: admin._id, count: 1 })
    await counter.save()
  }
}

/**
 * Checkout.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const checkout = async (req: Request, res: Response) => {
  try {
    let _user
    const { body }: { body: wexcommerceTypes.CheckoutPayload } = req
    const { user, order } = body

    const admin = await User.findOne({ email: env.ADMIN_EMAIL })
    if (!admin) {
      throw new Error(`Admin user ${env.ADMIN_EMAIL} not found`)
    }

    const settings = await Setting.findOne()
    if (!settings) {
      throw new Error('Settings not found')
    }
    i18n.locale = settings.language

    if (user) {
      user.verified = false
      user.blacklisted = false

      _user = new User(user)
      await _user.save()

      const token = new Token({ user: _user.id, token: helper.generateToken() })
      await token.save()

      const mailOptions = {
        from: env.SMTP_FROM,
        to: _user.email,
        subject: i18n.t('ACCOUNT_ACTIVATION_SUBJECT'),
        html: `<p>${i18n.t('HELLO')}${user.fullName},<br><br>${i18n.t('ACCOUNT_ACTIVATION_LINK')}<br><br>${helper.joinURL(env.FRONTEND_HOST, 'reset-password')
          }?u=${encodeURIComponent(_user.id)
          }&e=${encodeURIComponent(_user.email)
          }&t=${encodeURIComponent(token.token)
          }<br><br>${i18n.t('REGARDS')}<br>`
          + '</p>',
      }

      await mailHelper.sendMail(mailOptions)
    } else {
      _user = await User.findById(order.user)
    }

    if (!_user) {
      throw new Error('User not found')
    }

    // order
    const _order: wexcommerceTypes.OrderInfo = {
      user: _user!.id,
      paymentType: order.paymentType,
      deliveryType: order.deliveryType,
      total: order.total,
      status: wexcommerceTypes.OrderStatus.Pending,
    }

    // order.orderItems
    const __orderItems: string[] = []
    const orderItems: env.OrderItem[] = []
    for (const orderItem of order.orderItems!) {
      const _orderItem = new OrderItem(orderItem)
      await _orderItem.save()
      await _orderItem.populate<{ product: env.Product }>('product')
      orderItems.push(_orderItem)
      __orderItems.push(_orderItem.id)
    }
    _order.orderItems = __orderItems

    const paymentType = (await PaymentType.findById(order.paymentType))!.name
    const deliveryType = (await DeliveryType.findById(order.deliveryType))!.name

    if (paymentType === wexcommerceTypes.PaymentType.CreditCard) {
      const { paymentIntentId, sessionId } = body

      if (!paymentIntentId && !sessionId) {
        throw new Error('Payment intent and session missing')
      }

      _order.customerId = body.customerId

      if (paymentIntentId) {
        const paymentIntent = await stripeAPI.paymentIntents.retrieve(paymentIntentId)
        if (paymentIntent.status !== 'succeeded') {
          throw new Error(`Payment failed: ${paymentIntent.status}`)
        }

        _order.paymentIntentId = paymentIntentId
        _order.status = wexcommerceTypes.OrderStatus.Paid
      } else {
        //
        // Orders created from checkout with Stripe are temporary
        // and are automatically deleted if the payment checkout session expires.
        //
        let expireAt = new Date()
        expireAt.setSeconds(expireAt.getSeconds() + env.ORDER_EXPIRE_AT)

        _order.sessionId = body.sessionId
        _order.status = wexcommerceTypes.OrderStatus.Pending
        _order.expireAt = expireAt

        if (!_user.verified) {
          //
          // Non verified and active users created from checkout with Stripe are temporary
          // and are automatically deleted if the payment checkout session expires.
          //
          expireAt = new Date()
          expireAt.setSeconds(expireAt.getSeconds() + env.USER_EXPIRE_AT)

          _user.expireAt = expireAt
          await _user.save()
        }
      }
    }

    const __order = new Order(_order)
    await __order.save()

    if (paymentType !== wexcommerceTypes.PaymentType.CreditCard) {
      // user confirmation email
      await confirm(_user, __order, orderItems, settings, paymentType, deliveryType)

      // notify admin
      await notify(admin, __order, _user, settings)
    }

    return res.status(200).send({ orderId: __order.id })
  } catch (err) {
    logger.error(`[order.checkout] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update order status.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { user: userId, id } = req.params
    const { status }: wexcommerceTypes.UpdateOrderPayload = req.body

    if (!helper.isValidObjectId(userId)) {
      throw new Error('User id not valid')
    }

    if (!helper.isValidObjectId(id)) {
      throw new Error('User id not valid')
    }

    const admin = await User.find({ _id: userId, type: wexcommerceTypes.UserType.Admin })
    if (!admin) {
      throw new Error(`Admin user ${userId} not found.`)
    }

    const order = await Order
      .findById(id)
      .populate<{ user: env.User }>('user')

    if (order) {
      order.status = status
      await order.save()

      // user confirmation email
      const _user = order.user as env.User

      const settings = await Setting.findOne()
      if (!settings) {
        throw new Error('Settings not found')
      }
      i18n.locale = settings.language

      const message = i18n.t('ORDER_UPDATED_PART_1') + order._id + i18n.t('ORDER_UPDATED_PART_2')

      const mailOptions = {
        from: env.SMTP_FROM,
        to: _user.email,
        subject: i18n.t('ORDER_UPDATED_PART_1') + order._id + i18n.t('ORDER_UPDATED_PART_2'),
        html: `<p>${i18n.t('HELLO')}${_user.fullName},<br><br>${message}<br><br>${i18n.t('ORDER_CONFIRMED_PART_3')}<br><br>${helper.joinURL(env.FRONTEND_HOST, 'orders')
          }?o=${encodeURIComponent(order.id)
          }<br><br>${i18n.t('REGARDS')}<br>`
          + '</p>',
      }
      await mailHelper.sendMail(mailOptions)

      // user notification
      const notification = new Notification({ user: _user.id, message, order: order._id })

      await notification.save()
      let counter = await NotificationCounter.findOne({ user: _user.id })
      if (counter) {
        counter.count += 1
        await counter.save()
      } else {
        counter = new NotificationCounter({ user: _user.id, count: 1 })
        await counter.save()
      }

      return res.sendStatus(200)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[ordert.update] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete order.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { user: userId, id } = req.params

    if (!helper.isValidObjectId(userId)) {
      throw new Error('User id not valid')
    }

    if (!helper.isValidObjectId(id)) {
      throw new Error('User id not valid')
    }

    const admin = await User.find({ _id: userId, type: wexcommerceTypes.UserType.Admin })
    if (!admin) {
      throw new Error(`admin user ${userId} not found`)
    }

    const order = await Order.findByIdAndDelete(id)
    if (order) {
      await OrderItem.deleteMany({ _id: { $in: order.orderItems } })
      return res.sendStatus(200)
    }
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[order.delete] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete temporary Order created from checkout session.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteTempOrder = async (req: Request, res: Response) => {
  const { orderId, sessionId } = req.params

  try {
    if (!helper.isValidObjectId(orderId)) {
      throw new Error('Order id not valid')
    }

    const order = await Order.findOne({ _id: orderId, sessionId, status: wexcommerceTypes.OrderStatus.Pending, expireAt: { $ne: null } })
    if (order) {
      const user = await User.findOne({ _id: order.user, verified: false, expireAt: { $ne: null } })
      await user?.deleteOne()
    }

    await order?.deleteOne()
    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[order.deleteTempOrder] ${i18n.t('DB_ERROR')} ${JSON.stringify({ orderId, sessionId })}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get orders.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!helper.isValidObjectId(id)) {
      throw new Error('Order id not valid')
    }

    const data = await Order.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'User',
          let: { userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
          ],
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'OrderItem',
          let: { orderItems: '$orderItems' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$orderItems'] },
              },
            },
            {
              $lookup: {
                from: 'Product',
                let: { productId: '$product' },
                pipeline: [
                  {
                    $match: { $expr: { $eq: ['$_id', '$$productId'] } },
                  },
                ],
                as: 'product',
              },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
          ],
          as: 'orderItems',
        },
      },
      {
        $match: { orderItems: { $not: { $size: 0 } } },
      },
      {
        $lookup: {
          from: 'PaymentType',
          let: { paymentTypeId: '$paymentType' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$paymentTypeId'] },
              },
            },
          ],
          as: 'paymentType',
        },
      },
      { $unwind: { path: '$paymentType', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'DeliveryType',
          let: { deliveryTypeId: '$deliveryType' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$deliveryTypeId'] },
              },
            },
          ],
          as: 'deliveryType',
        },
      },
      { $unwind: { path: '$deliveryType', preserveNullAndEmptyArrays: false } },
    ])
    if (data.length > 0) {
      const order = data[0]
      const { _id, fullName } = order.user
      order.user = { _id, fullName }
      return res.json(order)
    }
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[order.getOrder] ${i18n.t('DB_ERROR')} ${req.body}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get orders.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { user: userId } = req.params

    if (!helper.isValidObjectId(userId)) {
      throw new Error('User id not valid')
    }

    const user = await User.findOne({ _id: userId })

    if (!user) {
      throw new Error(`User ${userId} not found`)
    }

    const page = parseInt(req.params.page, 10)
    const size = parseInt(req.params.size, 10)
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    const { paymentTypes, deliveryTypes, statuses }: wexcommerceTypes.GetOrdersPayload = req.body

    let $match: mongoose.FilterQuery<any> = {}
    if (user.type === wexcommerceTypes.UserType.User) {
      $match = {
        $and: [
          { 'user._id': { $eq: new mongoose.Types.ObjectId(userId) } },
          { 'paymentType.name': { $in: paymentTypes } },
          { 'deliveryType.name': { $in: deliveryTypes } },
          { status: { $in: statuses } },
          { expireAt: null },
        ],
      }
    } else if (user.type === wexcommerceTypes.UserType.Admin) {
      $match = {
        $and: [
          { 'paymentType.name': { $in: paymentTypes } },
          { 'deliveryType.name': { $in: deliveryTypes } },
          { status: { $in: statuses } },
          { expireAt: null },
        ],
      }
    }

    let isObjectId = false
    if (keyword) {
      isObjectId = helper.isValidObjectId(keyword)

      if (isObjectId) {
        $match.$and!.push({ _id: { $eq: new mongoose.Types.ObjectId(keyword) } })
      }
    }

    const { from, to, sortBy }: wexcommerceTypes.GetOrdersPayload = req.body

    if (from) {
      $match.$and!.push({ createdAt: { $gt: new Date(from) } })
    }
    if (to) {
      $match.$and!.push({ createdAt: { $lt: new Date(to) } })
    }

    let $sort: Record<string, 1 | -1 | Expression.Meta> = { createdAt: -1 } // dateDesc default
    if (sortBy) {
      if (sortBy === wexcommerceTypes.SortOrderBy.dateAsc) {
        $sort = { createdAt: 1 }
      }
    }

    // page search (aggregate)
    const data = await Order.aggregate([
      {
        $lookup: {
          from: 'User',
          let: { userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
          ],
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'OrderItem',
          let: { orderItems: '$orderItems' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$orderItems'] },
              },
            },
            {
              $lookup: {
                from: 'Product',
                let: { productId: '$product' },
                pipeline: [
                  {
                    $match: { $expr: { $eq: ['$_id', '$$productId'] } },
                  },
                ],
                as: 'product',
              },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
          ],
          as: 'orderItems',
        },
      },
      {
        $match:
          isObjectId ? {}
            : {
              $or: [
                { 'orderItems.product.name': { $regex: keyword, $options: options } },
                { 'user.fullName': { $regex: keyword, $options: options } },
              ],
            },
      },
      {
        $match: { orderItems: { $not: { $size: 0 } } },
      },
      {
        $lookup: {
          from: 'PaymentType',
          let: { paymentTypeId: '$paymentType' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$paymentTypeId'] },
              },
            },
          ],
          as: 'paymentType',
        },
      },
      { $unwind: { path: '$paymentType', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'DeliveryType',
          let: { deliveryTypeId: '$deliveryType' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$deliveryTypeId'] },
              },
            },
          ],
          as: 'deliveryType',
        },
      },
      { $unwind: { path: '$deliveryType', preserveNullAndEmptyArrays: false } },
      { $match },
      {
        $facet: {
          resultData: [
            { $sort },
            { $skip: ((page - 1) * size) },
            { $limit: size },
          ],
          pageInfo: [
            {
              $count: 'totalRecords',
            },
          ],
        },
      },
    ], { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } })

    if (data.length > 0) {
      const orders = data[0].resultData

      for (const order of orders) {
        const { _id, fullName } = order.user
        order.user = { _id, fullName }
      }
    }

    return res.json(data)
  } catch (err) {
    logger.error(`[order.getOrders] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
