import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const cartSchema = new Schema<env.Cart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  cartItems: {
    type: [Schema.Types.ObjectId],
    ref: 'CartItem',
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'Cart',
})

// Add custom indexes
cartSchema.index({ user: 1 })

const Cart = model<env.Cart>('Cart', cartSchema)

export default Cart
