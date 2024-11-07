import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

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

const Product = model<env.Product>('Product', productSchema)

export default Product
