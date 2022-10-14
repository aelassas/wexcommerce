import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    name: {
        type: [Schema.Types.ObjectId],
        ref: 'Value',
        validate: (value) => Array.isArray(value) && value.length > 1
    },
    description: {
        type: [Schema.Types.ObjectId],
        ref: 'Value',
        validate: (value) => Array.isArray(value) && value.length > 1
    },
    videosPerMonth: {
        type: Number,
        required: [true, "can't be blank"],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    price: {
        type: Number,
        required: [true, "can't be blank"]
    }
}, {
    timestamps: true,
    strict: true,
    collection: 'Subscription'
});

const subscriptionModel = mongoose.model('Subscription', subscriptionSchema);

subscriptionModel.on('index', (err) => {
    if (err) {
        console.error('Subscription index error: %s', err);
    } else {
        console.info('Subscription indexing complete');
    }
});

export default subscriptionModel;