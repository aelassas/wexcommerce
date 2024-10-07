import validator from 'validator';
import { Schema, model } from 'mongoose';
import * as wexcommerceTypes from "../../../../packages/wexcommerce-types/index.js";
const userSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    validate: [validator.isEmail, 'is not valid'],
    index: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, "can't be blank"],
    index: true,
    trim: true
  },
  phone: {
    type: String,
    validate: {
      validator: value => {
        // Check if value is empty then return true.
        if (!value) {
          return true;
        }
        // If value is empty will not validate for mobile phone.
        return validator.isMobilePhone(value);
      },
      message: '{VALUE} is not valid'
    },
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  active: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  language: {
    type: String,
    default: process.env.WC_DEFAULT_LANGUAGE,
    lowercase: true,
    minlength: 2,
    maxlength: 2
  },
  type: {
    type: String,
    enum: [wexcommerceTypes.UserType.Admin, wexcommerceTypes.UserType.User],
    default: wexcommerceTypes.UserType.User
  },
  blacklisted: {
    type: Boolean,
    default: false
  },
  customerId: {
    type: String
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true,
  strict: true,
  collection: 'User'
});
const User = model('User', userSchema);
export default User;