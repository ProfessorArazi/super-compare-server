const mongoose = require("mongoose");

const BitanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  group: {
    type: Number,
    required: true,
  },
});

const Bitan = mongoose.model("Bitan", BitanSchema);

module.exports = Bitan;
