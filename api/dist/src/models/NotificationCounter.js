import { Schema, model } from 'mongoose';
const notificationCounterSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: [true, "can't be blank"],
    unique: true,
    ref: 'User',
    index: true
  },
  count: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  }
}, {
  timestamps: true,
  strict: true,
  collection: 'NotificationCounter'
});
const NotificationCounter = model('NotificationCounter', notificationCounterSchema);
export default NotificationCounter;