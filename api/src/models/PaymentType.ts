import { Schema, model } from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as env from '../config/env.config'

const paymentTypeSchema = new Schema<env.PaymentType>({
  name: {
    type: String,
    enum: [
      wexcommerceTypes.PaymentType.CreditCard,
      wexcommerceTypes.PaymentType.Cod,
      wexcommerceTypes.PaymentType.WireTransfer,
    ],
    required: [true, "can't be blank"],
    unique: true,
    index: true,
  },
  enabled: {
    type: Boolean,
    required: [true, "can't be blank"],
    index: true,
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'PaymentType',
})

const PaymentType = model<env.PaymentType>('PaymentType', paymentTypeSchema)

export default PaymentType
