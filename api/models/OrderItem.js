import mongoose from 'mongoose'

const Schema = mongoose.Schema

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        required: [true, "can't be blank"],
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: [true, "can't be blank"],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    }
}, {
    timestamps: true,
    strict: true,
    collection: 'OrderItem'
})

const orderItemModel = mongoose.model('OrderItem', orderItemSchema)

orderItemModel.on('index', (err) => {
    if (err) {
        console.error('OrderItem index error: %s', err)
    } else {
        console.info('OrderItem indexing complete')
    }
})

export default orderItemModel