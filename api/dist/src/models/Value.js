import { Schema, model } from 'mongoose';
const locationValueSchema = new Schema({
  language: {
    type: String,
    required: [true, "can't be blank"],
    index: true,
    trim: true,
    lowercase: true,
    minLength: 2,
    maxLength: 2
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
});
const Value = model('Value', locationValueSchema);
export default Value;