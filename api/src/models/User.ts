import validator from 'validator'
import { Schema, model } from 'mongoose'
import * as wexcommerceTypes from ':wexcommerce-types'
// import * as wexcommerceHelper from ':wexcommerce-helper'
import * as env from '../config/env.config'

export const USER_EXPIRE_AT_INDEX_NAME = 'expireAt'

const userSchema = new Schema<env.User>(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      validate: [validator.isEmail, 'is not valid'],
      index: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "can't be blank"],
      index: true,
      trim: true,
    },
    phone: {
      type: String,
      validate: {
        validator: (value) => {
          // Check if value is empty then return true.
          if (!value) {
            return true
          }

          // If value is empty will not validate for mobile phone.
          return validator.isMobilePhone(value)
        },
        message: '{VALUE} is not valid',
      },
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    active: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    language: { // ISO 639-1 (alpha-2 code)
      type: String,
      default: env.DEFAULT_LANGUAGE,
      lowercase: true,
      minlength: 2,
      maxlength: 2,
    },
    type: {
      type: String,
      enum: [
        wexcommerceTypes.UserType.Admin,
        wexcommerceTypes.UserType.User,
      ],
      default: wexcommerceTypes.UserType.User,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    customerId: {
      type: String,
    },
    avatar: {
      type: String,
    },
    expireAt: {
      //
      // Non verified and active users created from checkout with Stripe are temporary and
      // are automatically deleted if the payment checkout session expires.
      //
      type: Date,
      index: { name: USER_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.USER_EXPIRE_AT, background: true },
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'User',
  },
)

const User = model<env.User>('User', userSchema)

export default User
