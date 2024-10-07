import { Schema, model } from 'mongoose';
const categorySchema = new Schema({
  values: {
    type: [Schema.Types.ObjectId],
    ref: 'Value',
    validate: value => Array.isArray(value)
  },
  image: {
    type: String
  }
}, {
  timestamps: true,
  strict: true,
  collection: 'Category'
});
const Category = model('Category', categorySchema);
export default Category;