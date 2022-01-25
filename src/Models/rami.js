const mongoose = require("mongoose");

const RamiSchema = new mongoose.Schema({
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

const Rami = mongoose.model("Rami", RamiSchema);

module.exports = Rami;
