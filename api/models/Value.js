import mongoose from 'mongoose'

const Schema = mongoose.Schema

const valueSchema = new Schema({
    language: {
        type: String,
        required: [true, "can't be blank"],
        index: true,
        trim: true,
        lowercase: true,
        minLength: 2,
        maxLength: 2,
    },
    value: {
        type: String,
        required: [true, "can't be blank"],
        index: true,
        trim: true
    }
}, {
    timestamps: true,
    strict: true,
    collection: 'Value'
})

const valueModel = mongoose.model('Value', valueSchema)

valueModel.on('index', (err) => {
    if (err) {
        console.error('Value index error: %s', err)
    } else {
        console.info('Value indexing complete')
    }
})

export default valueModel