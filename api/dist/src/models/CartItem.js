import { Schema, model } from 'mongoose';
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
});
const CartItem = model('CartItem', cartItemSchema);
export default CartItem;