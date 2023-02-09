import mongoose from 'mongoose'

const Schema = mongoose.Schema

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "can't be blank"],
    },
    description: {
        type: String,
        required: [true, "can't be blank"],
    },
    categories: {
        type: [Schema.Types.ObjectId],
        required: [true, "can't be blank"],
        ref: 'Category'
    },
    image: {
        type: String
    },
    images: {
        type: [String]
    },
    price: {
        type: Number,
        required: [true, "can't be blank"],
    },
    quantity: {
        type: Number,
        required: [true, "can't be blank"],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    soldOut: {
        type: Boolean,
        default: false
    },
    hidden: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    strict: true,
    collection: 'Product'
})

const productModel = mongoose.model('Product', productSchema)

productModel.on('index', (err) => {
    if (err) {
        console.error('Product index error: %s', err)
    } else {
        console.info('Product indexing complete')
    }
})

export default productModel