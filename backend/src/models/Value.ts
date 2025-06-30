import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

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
valueSchema.index(
  { value: 'text' },
  {
    default_language: 'none', // This disables stemming
    language_override: '_none', // Prevent MongoDB from expecting a language field
    background: true,
  },
)

const Value = model<env.Value>('Value', valueSchema)

export default Value
