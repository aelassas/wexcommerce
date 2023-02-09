import mongoose from 'mongoose'
import Env from '../config/env.config.js'

const Schema = mongoose.Schema

const paymentTypeSchema = new Schema({
    name: {
        type: String,
        enum: [
            Env.ORDER_STATUS.CREDIT_CARD,
            Env.ORDER_STATUS.COD,
            Env.ORDER_STATUS.WIRE_TRANSFER
        ],
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
})

const paymentTypeModel = mongoose.model('PaymentType', paymentTypeSchema)

paymentTypeModel.on('index', (err) => {
    if (err) {
        console.error('PaymentType index error: %s', err)
    } else {
        console.info('PaymentType indexing complete')
    }
})

export default paymentTypeModel