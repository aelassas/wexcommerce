import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const locationValueSchema = new Schema<env.Value>(
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

const Value = model<env.Value>('Value', locationValueSchema)

export default Value
