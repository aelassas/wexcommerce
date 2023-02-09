import mongoose from 'mongoose'
import Env from '../config/env.config.js'

const Schema = mongoose.Schema

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: [true, "can't be blank"],
        ref: 'User'
    },
    deliveryType: {
        type: Schema.Types.ObjectId,
        required: [true, "can't be blank"],
        ref: 'DeliveryType'
    },
    paymentType: {
        type: Schema.Types.ObjectId,
        required: [true, "can't be blank"],
        ref: 'PaymentType'
    },
    total: {
        type: Number,
        required: [true, "can't be blank"],
    },
    status: {
        type: String,
        enum: [
            Env.ORDER_STATUS.PENDING,
            Env.ORDER_STATUS.PAID,
            Env.ORDER_STATUS.CONFIRMED,
            Env.ORDER_STATUS.IN_PROGRESS,
            Env.ORDER_STATUS.CANCELLED,
            Env.ORDER_STATUS.SHIPPED
        ],
        required: [true, "can't be blank"],
    },
    orderItems: {
        type: [Schema.Types.ObjectId],
        ref: 'OrderItem'
    },
}, {
    timestamps: true,
    strict: true,
    collection: 'Order'
})

const orderModel = mongoose.model('Order', orderSchema)

orderModel.on('index', (err) => {
    if (err) {
        console.error('Order index error: %s', err)
    } else {
        console.info('Order indexing complete')
    }
})

export default orderModel