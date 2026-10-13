import { Request, Response } from 'express'
import i18n from '../lang/i18n'
import * as logger from '../utils/logger'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as env from '../config/env.config'
import Order from '../models/Order'
import OrderItem from '../models/OrderItem'
import Product from '../models/Product'
import User from '../models/User'
import Setting from '../models/Setting'
import PaymentType from '../models/PaymentType'
import DeliveryType from '../models/DeliveryType'
import * as orderController from './orderController'
import * as ipinfoHelper from '../utils/ipinfoHelper'

/**
 * Create PayPal order.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const createPayPalOrder = async (req: Request, res: Response) => {
  try {
    const paypal = await import('../payment/paypal.js')
    const { orderId, currency, name, description }: wexcommerceTypes.CreatePayPalOrderPayload = req.body

    // 1. Retrieve the authoritative order from database
    const order = await Order.findById(orderId)
    if (!order) {
      const msg = `Order with id ${orderId} not found`
      logger.info(`[paypal.createPayPalOrder] ${msg}`)
      res.status(204).send(msg)
      return
    }

    const clientIp = ipinfoHelper.getClientIp(req)
    const countryCode = await ipinfoHelper.getCountryCode(clientIp)

    // 2. Use order.total derived server-side instead of client-supplied amount
    const paypalOrderId = await paypal.createOrder(orderId, order.total, currency, name, description, countryCode)

    res.json(paypalOrderId)
  } catch (err) {
    logger.error(`[paypal.createPayPalOrder] ${i18n.t('ERROR')}`, err)
    res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Check Paypal order and update order if the payment succeeded.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const checkPayPalOrder = async (req: Request, res: Response) => {
  try {
    const paypal = await import('../payment/paypal.js')
    const { orderId, paypalOrderId } = req.params

    //
    // 1. Retrieve Checkout Session and Order
    //
    const order = await Order
      .findOne({ _id: orderId, expireAt: { $ne: null } })
      .populate<{ orderItems: env.OrderItem[] }>({
        path: 'orderItems',
      })

    if (!order) {
      const msg = `Order ${orderId} not found`
      logger.info(`[paypal.checkPayPalOrder] ${msg}`)
      res.status(204).send(msg)
      return
    }

    let paypalOrder
    try {
      paypalOrder = await paypal.getOrder(paypalOrderId as string)
    } catch (err) {
      logger.error(`[paypal.checkPayPalOrder] retrieve paypal order error: ${orderId}`, err)
    }

    if (!paypalOrder) {
      const msg = `Order ${paypalOrder} not found`
      logger.info(`[paypal.checkPayPalOrder] ${msg}`)
      res.status(204).send(msg)
      return
    }

    //
    // 2. Reconcile PayPal purchase unit data against database order
    //
    const purchaseUnit = paypalOrder.purchase_units?.[0]
    const paidAmount = Number.parseFloat(purchaseUnit?.amount?.value || '0')
    const invoiceId = purchaseUnit?.invoice_id

    // Check for invoice / order reference mismatch
    if (invoiceId && invoiceId !== orderId) {
      logger.error(`[paypal.checkPayPalOrder] Order ID mismatch. Expected ${orderId}, got ${invoiceId}`)
      res.status(400).send('Order ID mismatch')
      return
    }

    // Round expected total to 2 decimal places for comparison
    const expectedTotal = Number.parseFloat(order.total.toFixed(2))

    if (paidAmount !== expectedTotal) {
      logger.error(`[paypal.checkPayPalOrder] Total mismatch. Expected ${expectedTotal}, got ${paidAmount}`)
      res.status(400).send('Payment amount mismatch')
      return
    }

    //
    // 3. Update Order if the payment succeeded
    // (Set OrderStatus to Paid and remove expireAt TTL index)
    //
    if (paypalOrder.status === 'COMPLETED') {
      // Check settings
      const settings = await Setting.findOne({})
      if (!settings) {
        throw new Error('Settings not found')
      }

      for (const oi of order.orderItems) {
        const orderItem = await OrderItem.findById(oi._id.toString())
        orderItem!.expireAt = undefined
        await orderItem!.save()
      }
      order.expireAt = undefined
      order.status = wexcommerceTypes.OrderStatus.Paid
      await order.save()

      // Update product quantity
      for (const orderItem of order.orderItems) {
        const product = await Product.findById(orderItem.product)
        if (!product) {
          throw new Error(`Product ${orderItem.product} not found`)
        }
        product.quantity -= orderItem.quantity
        if (product.quantity <= 0) {
          product.soldOut = true
          product.quantity = 0
        }
        await product.save()
        orderItem.product = product
      }

      // Send confirmation email
      const user = await User.findById(order.user)
      if (!user) {
        throw new Error(`User ${order.user} not found`)
      }

      user.expireAt = undefined
      await user.save()

      const paymentType = (await PaymentType.findById(order.paymentType))!.name
      const deliveryType = (await DeliveryType.findById(order.deliveryType))!.name
      await orderController.confirm(user, order, order.orderItems, settings, paymentType, deliveryType)

      // Notify admin
      await orderController.notify(env.ADMIN_EMAIL, order, user, settings)

      res.sendStatus(200)
      return
    }

    //
    // 4. Delete Order if the payment didn't succeed
    //
    await order.deleteOne()
    res.status(400).send(paypalOrder.status)
  } catch (err) {
    logger.error(`[paypal.checkPayPalOrder] ${i18n.t('ERROR')}`, err)
    res.status(400).send(i18n.t('ERROR') + err)
  }
}
