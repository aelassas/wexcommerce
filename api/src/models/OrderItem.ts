import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const orderItemSchema = new Schema<env.OrderItem>({
    product: {
        type: Schema.Types.ObjectId,
        required: [true, "can't be blank"],
        ref: 'Product',
    },
    quantity: {
        type: Number,
        required: [true, "can't be blank"],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value',
        },
    },
}, {
    timestamps: true,
    strict: true,
    collection: 'OrderItem',
})

const OrderItem = model<env.OrderItem>('OrderItem', orderItemSchema)

export default OrderItem
