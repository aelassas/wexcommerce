import { Schema, model } from 'mongoose';
const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: [true, "can't be blank"],
    ref: 'User',
    index: true
  },
  message: {
    type: String,
    required: [true, "can't be blank"]
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  strict: true,
  collection: 'Notification'
});
const Notification = model('Notification', notificationSchema);
export default Notification;