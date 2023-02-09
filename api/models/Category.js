import mongoose from 'mongoose'

const Schema = mongoose.Schema

const categorySchema = new Schema({
    values: {
        type: [Schema.Types.ObjectId],
        ref: 'Value',
        validate: (value) => Array.isArray(value) && value.length > 1
    }
}, {
    timestamps: true,
    strict: true,
    collection: 'Category'
})

const categoryModel = mongoose.model('Category', categorySchema)

categoryModel.on('index', (err) => {
    if (err) {
        console.error('Category index error: %s', err)
    } else {
        console.info('Category indexing complete')
    }
})

export default categoryModel