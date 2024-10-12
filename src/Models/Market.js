const mongoose = require("mongoose");

const MarketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    englishName: {
        type: String,
        required: true,
        unique: true,
    },
    retailers: {
        type: Number,
        required: true,
    },
    branches: {
        type: Number,
        required: true,
    },
});

MarketSchema.virtual("id").get(function () {
    return this._id?.toHexString();
});

MarketSchema.set("toJSON", {
    virtuals: true,
});

const Market = mongoose.model("Market", MarketSchema);

module.exports = Market;
