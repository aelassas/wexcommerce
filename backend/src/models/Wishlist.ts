import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'
import * as logger from '../common/logger'

const wishlistSchema = new Schema<env.Wishlist>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  products: {
    type: [Schema.Types.ObjectId],
    ref: 'Product',
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'Wishlist',
})

// Add custom indexes
wishlistSchema.index({ user: 1 })

const Wishlist = model<env.Wishlist>('Wishlist', wishlistSchema)

// Create indexes manually and handle potential errors
Wishlist.createIndexes().catch((err) => {
  logger.error('Error creating Wishlist indexes:', err)
})

export default Wishlist
