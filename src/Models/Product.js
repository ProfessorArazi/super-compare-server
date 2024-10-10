const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema({
    market: {
        type: String,
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
    discount: {
        type: Number,
        default: 0,
    },
    discountPrice: {
        type: Number,
        default: 0,
    },
    img: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    categories: [
        {
            type: String,
            required: true,
        },
    ],
    isOutOfStock: {
        type: Boolean,
        required: true,
    },
    prices: [PriceSchema],
    last_updated: {
        type: Date,
        default: Date.now,
    },
});

ProductSchema.virtual("id").get(function () {
    return this._id?.toHexString();
});

ProductSchema.set("toJSON", {
    virtuals: true,
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
