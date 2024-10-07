import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const settingSchema = new Schema<env.Setting>({
  language: { // ISO 639-1 (alpha-2 code)
    type: String,
    default: env.DEFAULT_LANGUAGE,
    lowercase: true,
    minlength: 2,
    maxlength: 2,
  },
  currency: {
    type: String,
    default: env.DEFAULT_CURRENCY,
  },
  stripeCurrency: {
    type: String,
    default: env.DEFAULT_STRIPE_CURRENCY,
  },
  bankName: {
    type: String,
  },
  accountHolder: {
    type: String,
  },
  rib: {
    type: String,
  },
  iban: {
    type: String,
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'Setting',
})

const Setting = model<env.Setting>('Setting', settingSchema)

export default Setting
