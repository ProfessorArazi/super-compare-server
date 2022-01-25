const mongoose = require("mongoose");

const MegaSchema = new mongoose.Schema({
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

const Mega = mongoose.model("Mega", MegaSchema);

module.exports = Mega;
