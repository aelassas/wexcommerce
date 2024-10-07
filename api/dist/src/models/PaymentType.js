import { Schema, model } from 'mongoose';
import * as wexcommerceTypes from "../../../../packages/wexcommerce-types/index.js";
const paymentTypeSchema = new Schema({
  name: {
    type: String,
    enum: [wexcommerceTypes.PaymentType.CreditCard, wexcommerceTypes.PaymentType.Cod, wexcommerceTypes.PaymentType.WireTransfer],
    required: [true, "can't be blank"],
    unique: true,
    index: true
  },
  enabled: {
    type: Boolean,
    required: [true, "can't be blank"],
    index: true
  }
}, {
  timestamps: true,
  strict: true,
  collection: 'PaymentType'
});
const PaymentType = model('PaymentType', paymentTypeSchema);
export default PaymentType;