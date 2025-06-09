import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'
import * as logger from '../common/logger'

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

// Create indexes manually and handle potential errors
Cart.createIndexes().catch((err) => {
  logger.error('Error creating Cart indexes:', err)
})

export default Cart
