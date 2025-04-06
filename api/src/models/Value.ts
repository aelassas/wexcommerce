import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'
import * as logger from '../common/logger'

const valueSchema = new Schema<env.Value>(
  {
    language: {
      type: String,
      required: [true, "can't be blank"],
      index: true,
      trim: true,
      lowercase: true,
      minLength: 2,
      maxLength: 2,
    },
    value: {
      type: String,
      required: [true, "can't be blank"],
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'Value',
  },
)

// Add custom indexes
valueSchema.index({ language: 1, value: 1 })
valueSchema.index({ value: 'text' })

const Value = model<env.Value>('Value', valueSchema)

// Create indexes manually and handle potential errors
Value.syncIndexes().catch((err) => {
  logger.error('Error creating Value indexes:', err)
})


export default Value
