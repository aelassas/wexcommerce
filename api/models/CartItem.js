import mongoose from 'mongoose'

const Schema = mongoose.Schema

const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        required: [true, "can't be blank"],
        ref: 'Product'
    },
    quantity: {
        type: Number,
        default: 1,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    }
}, {
    timestamps: true,
    strict: true,
    collection: 'CartItem'
})

const cartItemModel = mongoose.model('CartItem', cartItemSchema)

cartItemModel.on('index', (err) => {
    if (err) {
        console.error('CartItem index error: %s', err)
    } else {
        console.info('CartItem indexing complete')
    }
})

export default cartItemModel