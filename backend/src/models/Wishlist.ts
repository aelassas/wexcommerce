import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

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

export default Wishlist
