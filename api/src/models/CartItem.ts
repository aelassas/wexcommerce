import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const cartItemSchema = new Schema<env.CartItem>({
  product: {
    type: Schema.Types.ObjectId,
    required: [true, "can't be blank"],
    ref: 'Product',
  },
  quantity: {
    type: Number,
    default: 1,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    },
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'CartItem',
})

const CartItem = model<env.CartItem>('CartItem', cartItemSchema)

export default CartItem
