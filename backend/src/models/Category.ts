import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const categorySchema = new Schema<env.Category>({
  values: {
    type: [Schema.Types.ObjectId],
    ref: 'Value',
    validate: (value: any) => Array.isArray(value),
  },
  image: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'Category',
})

// Add custom indexes
categorySchema.index({ values: 1 })

const Category = model<env.Category>('Category', categorySchema)

export default Category
