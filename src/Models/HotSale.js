const mongoose = require("mongoose");

const HotSaleSchema = new mongoose.Schema({
    market: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Market",
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
        required: true,
    },

    percentage: {
        type: Number,
        required: true,
    },
});

module.exports = HotSaleSchema;
