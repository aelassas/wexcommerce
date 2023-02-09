import mongoose from 'mongoose'

const Schema = mongoose.Schema

const settingSchema = new Schema({
    language: { // ISO 639-1 (alpha-2 code)
        type: String,
        default: process.env.WC_DEFAULT_LANGUAGE,
        lowercase: true,
        minlength: 2,
        maxlength: 2
    },
    currency: {
        type: String,
        default: process.env.WC_DEFAULT_CURRENCY,
    },
    bankName: {
        type: String,
    },
    accountHolder: {
        type: String,
    },
    rib: {
        type: String,
    },
    iban: {
        type: String,
    }
}, {
    timestamps: true,
    strict: true,
    collection: 'Setting'
})

const settingModel = mongoose.model('Setting', settingSchema)

settingModel.on('index', (err) => {
    if (err) {
        console.error('Setting index error: %s', err)
    } else {
        console.info('Setting indexing complete')
    }
})

export default settingModel