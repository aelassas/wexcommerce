import { Schema, model } from 'mongoose';
const settingSchema = new Schema({
  language: {
    type: String,
    default: process.env.WC_DEFAULT_LANGUAGE,
    lowercase: true,
    minlength: 2,
    maxlength: 2
  },
  currency: {
    type: String,
    default: process.env.WC_DEFAULT_CURRENCY
  },
  bankName: {
    type: String
  },
  accountHolder: {
    type: String
  },
  rib: {
    type: String
  },
  iban: {
    type: String
  }
}, {
  timestamps: true,
  strict: true,
  collection: 'Setting'
});
const Setting = model('Setting', settingSchema);
export default Setting;