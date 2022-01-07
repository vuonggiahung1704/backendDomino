const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: {
      type: String,
    },
    price: { type: Number, required: true },
    sale: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    image: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
