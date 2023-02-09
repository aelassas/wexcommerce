import mongoose from 'mongoose'

const Schema = mongoose.Schema

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cartItems: {
        type: [Schema.Types.ObjectId],
        ref: 'CartItem'
    }
}, {
    timestamps: true,
    strict: true,
    collection: 'Cart'
})

const cartModel = mongoose.model('Cart', cartSchema)

cartModel.on('index', (err) => {
    if (err) {
        console.error('Cart index error: %s', err)
    } else {
        console.info('Cart indexing complete')
    }
})

export default cartModel