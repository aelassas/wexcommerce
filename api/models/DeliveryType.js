import mongoose from 'mongoose'
import Env from '../config/env.config.js'

const Schema = mongoose.Schema

const deliveryTypeSchema = new Schema({
    name: {
        type: String,
        enum: [
            Env.DELIVERY_TYPE.SHIPPING,
            Env.DELIVERY_TYPE.WITHDRAWAL
        ],
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
    },
}, {
    timestamps: true,
    strict: true,
    collection: 'DeliveryType'
})

const deliveryTypeModel = mongoose.model('DeliveryType', deliveryTypeSchema)

deliveryTypeModel.on('index', (err) => {
    if (err) {
        console.error('DeliveryType index error: %s', err)
    } else {
        console.info('DeliveryType indexing complete')
    }
})

export default deliveryTypeModel