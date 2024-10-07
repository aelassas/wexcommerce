import { Schema, model } from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as env from '../config/env.config'

export const ORDER_EXPIRE_AT_INDEX_NAME = 'expireAt'

const orderSchema = new Schema<env.Order>({
  user: {
    type: Schema.Types.ObjectId,
    required: [true, "can't be blank"],
    ref: 'User',
  },
  deliveryType: {
    type: Schema.Types.ObjectId,
    required: [true, "can't be blank"],
    ref: 'DeliveryType',
  },
  paymentType: {
    type: Schema.Types.ObjectId,
    required: [true, "can't be blank"],
    ref: 'PaymentType',
  },
  total: {
    type: Number,
    required: [true, "can't be blank"],
  },
  status: {
    type: String,
    enum: [
      wexcommerceTypes.OrderStatus.Pending,
      wexcommerceTypes.OrderStatus.Paid,
      wexcommerceTypes.OrderStatus.Confirmed,
      wexcommerceTypes.OrderStatus.InProgress,
      wexcommerceTypes.OrderStatus.Cancelled,
      wexcommerceTypes.OrderStatus.Shipped,
    ],
    required: [true, "can't be blank"],
  },
  orderItems: {
    type: [Schema.Types.ObjectId],
    ref: 'OrderItem',
  },
  sessionId: {
    type: String,
    index: true,
  },
  paymentIntentId: {
    type: String,
  },
  customerId: {
    type: String,
  },
  expireAt: {
    //
    // Orders created from checkout with Stripe are temporary and
    // are automatically deleted if the payment checkout session expires.
    //
    type: Date,
    index: { name: ORDER_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.ORDER_EXPIRE_AT, background: true },
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'Order',
})

const Order = model<env.Order>('Order', orderSchema)

export default Order
