import { Schema, model } from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as env from '../config/env.config'

const deliveryTypeSchema = new Schema<env.DeliveryType>({
  name: {
    type: String,
    enum: [
      wexcommerceTypes.DeliveryType.Shipping,
      wexcommerceTypes.DeliveryType.Withdrawal,
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
  price: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'DeliveryType',
})

const DeliveryType = model<env.DeliveryType>('DeliveryType', deliveryTypeSchema)

export default DeliveryType
