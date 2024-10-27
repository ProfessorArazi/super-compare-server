const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema({
    market: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Market",
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    retailerProductId: {
        type: Number,
        required: true,
    },
    unitResolution: {
        type: Number,
        default: 1,
    },

    discount: {
        type: Number,
        default: 0,
    },
    discountPrice: {
        type: Number,
        default: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = PriceSchema;
