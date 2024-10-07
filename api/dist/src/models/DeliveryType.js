import { Schema, model } from 'mongoose';
import * as wexcommerceTypes from "../../../../packages/wexcommerce-types/index.js";
const deliveryTypeSchema = new Schema({
  name: {
    type: String,
    enum: [wexcommerceTypes.DeliveryType.Shipping, wexcommerceTypes.DeliveryType.Withdrawal],
    required: [true, "can't be blank"],
    unique: true,
    index: true
  },
  enabled: {
    type: Boolean,
    required: [true, "can't be blank"],
    index: true
  },
  price: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  strict: true,
  collection: 'DeliveryType'
});
const DeliveryType = model('DeliveryType', deliveryTypeSchema);
export default DeliveryType;