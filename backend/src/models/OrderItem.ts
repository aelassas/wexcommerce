import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

export const ORDER_ITEM_EXPIRE_AT_INDEX_NAME = 'expireAt'

const orderItemSchema = new Schema<env.OrderItem>({
    product: {
        type: Schema.Types.ObjectId,
        required: [true, "can't be blank"],
        ref: 'Product',
    },
    quantity: {
        type: Number,
        required: [true, "can't be blank"],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value',
        },
    },
    expireAt: {
      //
      // OrderItems created from checkout with Stripe are temporary and
      // are automatically deleted if the payment checkout session expires.
      //
      type: Date,
      index: { name: ORDER_ITEM_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.ORDER_EXPIRE_AT, background: true },
    },
}, {
    timestamps: true,
    strict: true,
    collection: 'OrderItem',
})

const OrderItem = model<env.OrderItem>('OrderItem', orderItemSchema)

export default OrderItem
