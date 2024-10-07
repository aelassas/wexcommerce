import { Schema, model } from 'mongoose';
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
});
const Cart = model('Cart', cartSchema);
export default Cart;