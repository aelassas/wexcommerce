import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'
import * as logger from '../common/logger'

const productSchema = new Schema<env.Product>({
  name: {
    type: String,
    required: [true, "can't be blank"],
  },
  description: {
    type: String,
    required: [true, "can't be blank"],
  },
  categories: {
    type: [Schema.Types.ObjectId],
    required: [true, "can't be blank"],
    ref: 'Category',
  },
  image: {
    type: String,
  },
  images: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: [true, "can't be blank"],
  },
  quantity: {
    type: Number,
    required: [true, "can't be blank"],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    },
  },
  soldOut: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'Product',
})

// Add indexes to optimize queries
productSchema.index({ categories: 1, name: 1, hidden: 1 }) // Optimizes category + name + hidden filter
productSchema.index({ name: 1, hidden: 1 }) // For cases without category filtering
productSchema.index({ price: 1, createdAt: -1 }) // For price sorting with createdAt as tie-breaker
productSchema.index({ price: -1, createdAt: -1 }) // For price descending sorting with createdAt as tie-breaker
productSchema.index({ featured: -1, createdAt: -1 }) // For featured sorting with createdAt as tie-breaker
productSchema.index({ createdAt: -1 }) // Default sorting by createdAt
productSchema.index(
  { name: 'text' },
  {
    default_language: 'none', // This disables stemming
    language_override: '_none', // Prevent MongoDB from expecting a language field
    background: true,
  },
)

const Product = model<env.Product>('Product', productSchema)

// Create indexes manually and handle potential errors
Product.createIndexes().catch((err) => {
  logger.error('Error creating Product indexes:', err)
})

export default Product
